"use strict";

const crypto = require("node:crypto");

const MAX_BODY_BYTES = 12 * 1024;
const MAX_RATING_COMMENT = 1200;
const MAX_BUG_DESCRIPTION = 2000;
const MAX_BUG_STEPS = 2000;

function apiError(status, code) {
  const error = new Error(code);
  error.status = status;
  error.code = code;
  return error;
}

function cleanOptionalText(value, maxLength, fieldName) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") throw apiError(400, "invalid_submission");
  const cleaned = value.normalize("NFC").trim();
  if (cleaned.length > maxLength) throw apiError(400, fieldName + "_too_long");
  return cleaned.length ? cleaned : null;
}

function validateSubmission(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw apiError(400, "invalid_submission");
  }

  const kind = body.kind;
  const appVersion = typeof body.appVersion === "string" ? body.appVersion.trim() : "";
  const locale = typeof body.locale === "string" ? body.locale.trim() : "";
  if (appVersion.length > 32 || locale.length > 64) {
    throw apiError(400, "invalid_submission");
  }

  if (kind === "rating") {
    if (!Number.isInteger(body.rating) || body.rating < 1 || body.rating > 5) {
      throw apiError(400, "invalid_rating");
    }
    const message = cleanOptionalText(body.message, MAX_RATING_COMMENT, "comment");
    return {
      kind,
      rating: body.rating,
      message,
      steps: null,
      appVersion: appVersion || "unknown",
      locale: locale || "unknown",
    };
  }

  if (kind === "bug") {
    if (body.rating !== undefined && body.rating !== null) {
      throw apiError(400, "invalid_submission");
    }
    const message = cleanOptionalText(body.message, MAX_BUG_DESCRIPTION, "description");
    if (!message) throw apiError(400, "description_required");
    const steps = cleanOptionalText(body.steps, MAX_BUG_STEPS, "steps");
    return {
      kind,
      rating: null,
      message,
      steps,
      appVersion: appVersion || "unknown",
      locale: locale || "unknown",
    };
  }

  throw apiError(400, "invalid_submission");
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const length = Number(req.headers["content-length"] || 0);
    if (Number.isFinite(length) && length > MAX_BODY_BYTES) {
      req.resume();
      reject(apiError(413, "request_too_large"));
      return;
    }

    let size = 0;
    let rejectedForSize = false;
    const chunks = [];

    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        rejectedForSize = true;
        chunks.length = 0;
        req.resume();
        return;
      }
      if (!rejectedForSize) chunks.push(chunk);
    });
    req.on("end", () => {
      if (rejectedForSize) {
        reject(apiError(413, "request_too_large"));
        return;
      }
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(JSON.parse(raw));
      } catch {
        reject(apiError(400, "invalid_json"));
      }
    });
    req.on("error", () => reject(apiError(400, "invalid_json")));
  });
}

function response(res, status, body, extraHeaders) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  for (const [name, value] of Object.entries(extraHeaders || {})) {
    res.setHeader(name, value);
  }
  res.end(JSON.stringify(body));
}

function requestAddress(req) {
  const forwarded = req.headers["x-forwarded-for"];
  const value = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  const address = typeof value === "string" ? value.split(",")[0].trim() : "";
  // Vercel overwrites X-Forwarded-For with the client address before a function runs.
  // Do not fall back to the shared function socket address when this header is absent.
  return address;
}

function requiredEnvironment() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SECRET_KEY;
  const hashSecret = process.env.FEEDBACK_IP_HASH_SECRET;
  if (!supabaseUrl || !serviceKey || !hashSecret || hashSecret.length < 32) {
    throw apiError(503, "service_unavailable");
  }
  let parsedUrl;
  try {
    parsedUrl = new URL(supabaseUrl);
  } catch {
    throw apiError(503, "service_unavailable");
  }
  if (parsedUrl.protocol !== "https:") throw apiError(503, "service_unavailable");
  return { supabaseUrl: parsedUrl, serviceKey, hashSecret };
}

async function submitToSupabase(submission, rateKeyHash, config) {
  const endpoint = new URL("/rest/v1/rpc/submit_kabirui_feedback", config.supabaseUrl);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const result = await fetch(endpoint, {
      method: "POST",
      headers: {
        apikey: config.serviceKey,
        Authorization: "Bearer " + config.serviceKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        p_kind: submission.kind,
        p_rating: submission.rating,
        p_message: submission.message,
        p_steps: submission.steps,
        p_app_version: submission.appVersion,
        p_locale: submission.locale,
        p_rate_key_hash: rateKeyHash,
      }),
      signal: controller.signal,
    });
    if (!result.ok) throw apiError(502, "service_unavailable");
    const status = await result.json().catch(() => null);
    if (typeof status === "string" && status.startsWith("rate_limited:")) {
      const retryAfter = Number(status.slice("rate_limited:".length));
      if (Number.isInteger(retryAfter) && retryAfter > 0) return { kind: "rate_limited", retryAfter };
    }
    if (status !== "accepted") throw apiError(502, "service_unavailable");
    return { kind: "accepted" };
  } catch (error) {
    if (error?.code) throw error;
    throw apiError(502, "service_unavailable");
  } finally {
    clearTimeout(timeout);
  }
}

async function handler(req, res) {
  if (req.method !== "POST") {
    response(res, 405, { ok: false, code: "method_not_allowed" }, { Allow: "POST" });
    return;
  }
  const contentType = String(req.headers["content-type"] || "").toLowerCase();
  if (!contentType.startsWith("application/json")) {
    response(res, 415, { ok: false, code: "json_required" });
    return;
  }

  try {
    const submission = validateSubmission(await readJsonBody(req));
    const config = requiredEnvironment();
    const address = requestAddress(req);
    if (!address) throw apiError(503, "service_unavailable");
    const rateKeyHash = crypto.createHmac("sha256", config.hashSecret).update(address).digest("hex");
    const result = await submitToSupabase(submission, rateKeyHash, config);
    if (result.kind === "rate_limited") {
      response(res, 429, { ok: false, code: "rate_limited" }, { "Retry-After": String(result.retryAfter) });
      return;
    }
    response(res, 201, { ok: true });
  } catch (error) {
    const status = Number.isInteger(error?.status) ? error.status : 502;
    const code = typeof error?.code === "string" ? error.code : "service_unavailable";
    response(res, status, { ok: false, code });
  }
}

module.exports = handler;
module.exports.config = { api: { bodyParser: false } };
module.exports.validateSubmission = validateSubmission;

