import { randomUUID } from "node:crypto";
import { put } from "@vercel/blob";

const MAX_MESSAGE_LENGTH = 2000;

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Access-Control-Allow-Origin", "https://kabirui.kabirinvents.com");
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (request.method === "OPTIONS") return response.status(204).end();
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST, OPTIONS");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const body = typeof request.body === "string"
    ? (() => { try { return JSON.parse(request.body); } catch { return null; } })()
    : request.body;
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const versionName = typeof body?.versionName === "string" ? body.versionName.trim().slice(0, 50) : "";
  const versionCode = Number(body?.versionCode);

  if (!message || message.length > MAX_MESSAGE_LENGTH) {
    return response.status(400).json({ error: "Feedback must be between 1 and 2000 characters." });
  }
  if (!versionName || !Number.isSafeInteger(versionCode) || versionCode < 1) {
    return response.status(400).json({ error: "A valid app version is required." });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return response.status(503).json({ error: "Feedback storage is not configured yet." });
  }

  const id = randomUUID();
  const record = {
    id,
    message,
    versionName,
    versionCode,
    receivedAt: new Date().toISOString(),
  };

  try {
    await put(`feedback/${record.receivedAt.slice(0, 10)}/${id}.json`, JSON.stringify(record), {
      access: "private",
      addRandomSuffix: false,
      contentType: "application/json; charset=utf-8",
    });
    return response.status(201).json({ ok: true });
  } catch {
    return response.status(503).json({ error: "Feedback could not be stored right now." });
  }
}
