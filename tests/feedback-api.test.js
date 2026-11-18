"use strict";

const assert = require("node:assert/strict");
const { PassThrough } = require("node:stream");
const test = require("node:test");
const handler = require("../api/feedback.js");

function mockRequest(method, body, headers = {}) {
  const req = new PassThrough();
  req.method = method;
  req.headers = {
    "content-type": "application/json",
    "content-length": Buffer.byteLength(body),
    "x-forwarded-for": "203.0.113.24",
    ...headers,
  };
  req.socket = { remoteAddress: "127.0.0.1" };
  process.nextTick(() => {
    req.write(body);
    req.end();
  });
  return req;
}

function mockResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: "",
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
    },
    end(body) {
      this.body = body;
    },
  };
}

function withEnvironment(values, action) {
  const names = ["SUPABASE_URL", "SUPABASE_SECRET_KEY", "FEEDBACK_IP_HASH_SECRET"];
  const previous = Object.fromEntries(names.map((name) => [name, process.env[name]]));
  for (const name of names) {
    if (values[name] === undefined) delete process.env[name];
    else process.env[name] = values[name];
  }
  return Promise.resolve()
    .then(action)
    .finally(() => {
      for (const name of names) {
        if (previous[name] === undefined) delete process.env[name];
        else process.env[name] = previous[name];
      }
    });
}

const configuredEnvironment = {
  SUPABASE_URL: "https://feedback-project.supabase.co",
  SUPABASE_SECRET_KEY: "server-only-test-key",
  FEEDBACK_IP_HASH_SECRET: "test-secret-that-is-long-enough-for-hmac",
};

test("accepts an anonymous rating with an optional comment", async () => {
  const originalFetch = global.fetch;
  let call;
  global.fetch = async (url, options) => {
    call = { url: String(url), options };
    return { ok: true, status: 200, json: async () => "accepted" };
  };
  try {
    await withEnvironment(configuredEnvironment, async () => {
      const req = mockRequest("POST", JSON.stringify({
        kind: "rating",
        rating: 5,
        message: "Good launcher",
        appVersion: "6.0.0",
        locale: "en-US",
      }));
      const res = mockResponse();
      await handler(req, res);
      assert.equal(res.statusCode, 201);
      assert.deepEqual(JSON.parse(res.body), { ok: true });
      assert.equal(call.url, "https://feedback-project.supabase.co/rest/v1/rpc/submit_kabirui_feedback");
      const payload = JSON.parse(call.options.body);
      assert.equal(payload.p_kind, "rating");
      assert.equal(payload.p_rating, 5);
      assert.equal(payload.p_message, "Good launcher");
      assert.equal(payload.p_steps, null);
      assert.equal(payload.p_rate_key_hash.length, 64);
      assert.equal(call.options.headers.Authorization, "Bearer server-only-test-key");
    });
  } finally {
    global.fetch = originalFetch;
  }
});

test("rejects out-of-range ratings without contacting Supabase", async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => {
    throw new Error("fetch should not run");
  };
  try {
    await withEnvironment(configuredEnvironment, async () => {
      const req = mockRequest("POST", JSON.stringify({ kind: "rating", rating: 6 }));
      const res = mockResponse();
      await handler(req, res);
      assert.equal(res.statusCode, 400);
      assert.equal(JSON.parse(res.body).code, "invalid_rating");
    });
  } finally {
    global.fetch = originalFetch;
  }
});

test("requires a bug description and accepts optional reproduction steps", async () => {
  const originalFetch = global.fetch;
  let payload;
  global.fetch = async (_url, options) => {
    payload = JSON.parse(options.body);
    return { ok: true, status: 200, json: async () => "accepted" };
  };
  try {
    await withEnvironment(configuredEnvironment, async () => {
      const invalidReq = mockRequest("POST", JSON.stringify({ kind: "bug", message: "   " }));
      const invalidRes = mockResponse();
      await handler(invalidReq, invalidRes);
      assert.equal(invalidRes.statusCode, 400);
      assert.equal(JSON.parse(invalidRes.body).code, "description_required");

      const req = mockRequest("POST", JSON.stringify({
        kind: "bug",
        message: "Widget does not appear",
        steps: "Open the picker, then tap Add",
        appVersion: "6.0.0",
        locale: "en-US",
      }));
      const res = mockResponse();
      await handler(req, res);
      assert.equal(res.statusCode, 201);
      assert.equal(payload.p_kind, "bug");
      assert.equal(payload.p_rating, null);
      assert.equal(payload.p_message, "Widget does not appear");
      assert.equal(payload.p_steps, "Open the picker, then tap Add");
    });
  } finally {
    global.fetch = originalFetch;
  }
});

test("returns the rolling-window retry time when the database rate limiter rejects a submission", async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => ({ ok: true, status: 200, json: async () => "rate_limited:42" });
  try {
    await withEnvironment(configuredEnvironment, async () => {
      const req = mockRequest("POST", JSON.stringify({ kind: "rating", rating: 3 }));
      const res = mockResponse();
      await handler(req, res);
      assert.equal(res.statusCode, 429);
      assert.equal(res.headers["retry-after"], "42");
    });
  } finally {
    global.fetch = originalFetch;
  }
});

test("keeps service-unavailable responses honest when Vercel is not configured", async () => {
  await withEnvironment({}, async () => {
    const req = mockRequest("POST", JSON.stringify({ kind: "rating", rating: 4 }));
    const res = mockResponse();
    await handler(req, res);
    assert.equal(res.statusCode, 503);
    assert.equal(JSON.parse(res.body).code, "service_unavailable");
  });
});

test("does not rate-limit all clients against a shared socket when Vercel's client header is missing", async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => {
    throw new Error("fetch should not run without a trusted client address");
  };
  try {
    await withEnvironment(configuredEnvironment, async () => {
      const req = mockRequest("POST", JSON.stringify({ kind: "rating", rating: 4 }), {
        "x-forwarded-for": undefined,
      });
      const res = mockResponse();
      await handler(req, res);
      assert.equal(res.statusCode, 503);
      assert.equal(JSON.parse(res.body).code, "service_unavailable");
    });
  } finally {
    global.fetch = originalFetch;
  }
});

test("rejects unsupported methods and oversized payloads", async () => {
  const methodRes = mockResponse();
  await handler(mockRequest("GET", "{}"), methodRes);
  assert.equal(methodRes.statusCode, 405);
  assert.equal(methodRes.headers.allow, "POST");

  const body = JSON.stringify({ kind: "rating", rating: 5, message: "x".repeat(13000) });
  const sizeReq = mockRequest("POST", body);
  const sizeRes = mockResponse();
  await handler(sizeReq, sizeRes);
  assert.equal(sizeRes.statusCode, 413);
});

