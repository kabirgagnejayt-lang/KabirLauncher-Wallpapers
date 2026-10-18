import { createHmac, randomUUID } from 'node:crypto';

const MAX_BODY_BYTES = 8 * 1024;
const MAX_MESSAGE_LENGTH = 2_000;
const FEEDBACK_RETENTION_SECONDS = 365 * 24 * 60 * 60;

function json(status, body, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...headers,
    },
  });
}

async function readBoundedBody(request) {
  const declaredLength = Number(request.headers.get('content-length'));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    throw new RangeError('Request body is too large.');
  }
  if (!request.body) return '';

  const reader = request.body.getReader();
  const chunks = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new RangeError('Request body is too large.');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

function clientAddress(request) {
  const forwarded = request.headers.get('x-vercel-forwarded-for')
    ?? request.headers.get('x-real-ip')
    ?? request.headers.get('x-forwarded-for');
  const candidates = forwarded?.split(',').map((part) => part.trim()).filter(Boolean) ?? [];
  return candidates[0] || 'unknown';
}

function rateLimitKey(address, secret) {
  return createHmac('sha256', secret).update(address).digest('hex');
}

export function createFeedbackHandler({
  redis,
  limiter,
  now = () => Date.now(),
  id = () => randomUUID(),
  rateLimitSecret,
  onError = () => {},
}) {
  return async function handleFeedback(request) {
    if (request.method !== 'POST') {
      return json(405, { ok: false, message: 'Use POST to send feedback.' }, { Allow: 'POST' });
    }
    if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type') ?? '')) {
      return json(415, { ok: false, message: 'Send feedback as JSON.' });
    }

    let payload;
    try {
      const body = await readBoundedBody(request);
      payload = JSON.parse(body);
    } catch (error) {
      return error instanceof RangeError
        ? json(413, { ok: false, message: 'Feedback is too large.' })
        : json(400, { ok: false, message: 'Check the feedback form and try again.' });
    }

    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return json(400, { ok: false, message: 'Check the feedback form and try again.' });
    }
    const message = typeof payload.message === 'string' ? payload.message.trim() : '';
    const versionName = typeof payload.versionName === 'string' ? payload.versionName.trim() : '';
    const versionCode = Number(payload.versionCode);
    if (
      !message || message.length > MAX_MESSAGE_LENGTH ||
      /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(message) ||
      !versionName || versionName.length > 64 ||
      !Number.isSafeInteger(versionCode) || versionCode <= 0
    ) {
      return json(400, { ok: false, message: 'Check the feedback form and try again.' });
    }

    if (!redis || !limiter || !rateLimitSecret) {
      return json(503, { ok: false, message: 'Feedback is temporarily unavailable.' });
    }

    try {
      const addressHash = rateLimitKey(clientAddress(request), rateLimitSecret);
      const limit = await limiter.limit(addressHash);
      if (!limit.success) {
        const retryAfterSeconds = Math.max(1, Math.ceil(((limit.reset ?? now()) - now()) / 1_000));
        return json(429, { ok: false, message: 'Please wait before sending more feedback.' }, { 'Retry-After': String(retryAfterSeconds) });
      }

      const receivedAt = new Date(now()).toISOString();
      await redis.set(`kabirui:feedback:inbox:${id()}`, {
        message,
        versionName,
        versionCode,
        receivedAt,
      }, { ex: FEEDBACK_RETENTION_SECONDS });

      return json(201, { ok: true, message: 'Thanks for helping improve KabirUI.' });
    } catch (error) {
      onError(error);
      return json(503, { ok: false, message: 'Feedback is temporarily unavailable.' });
    }
  };
}

let productionHandler;
async function getProductionHandler() {
  if (productionHandler) return productionHandler;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const [{ Redis }, { Ratelimit }] = await Promise.all([
    import('@upstash/redis'),
    import('@upstash/ratelimit'),
  ]);
  const redis = new Redis({ url, token });
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 h'),
    prefix: 'kabirui:feedback:rate-limit',
  });
  productionHandler = createFeedbackHandler({
    redis,
    limiter,
    rateLimitSecret: process.env.FEEDBACK_RATE_LIMIT_SECRET || token,
    onError: (error) => console.error('KabirUI feedback storage failed:', error?.name || 'unknown error'),
  });
  return productionHandler;
}

export default {
  async fetch(request) {
    try {
      const handler = await getProductionHandler();
      if (!handler) return json(503, { ok: false, message: 'Feedback is temporarily unavailable.' });
      return await handler(request);
    } catch (error) {
      console.error('KabirUI feedback API failed:', error?.name || 'unknown error');
      return json(503, { ok: false, message: 'Feedback is temporarily unavailable.' });
    }
  },
};
