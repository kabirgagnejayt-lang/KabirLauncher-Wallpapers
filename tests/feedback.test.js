import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import test from 'node:test';
import { createFeedbackHandler } from '../api/feedback.js';

const NOW = Date.parse('2026-10-18T11:00:00.000Z');
const validBody = {
  message: 'The launcher feels great.',
  versionName: '4.0.0',
  versionCode: 12,
};

function fixture({ limitResult = { success: true }, save = async () => {} } = {}) {
  const calls = { keys: [], records: [] };
  const handler = createFeedbackHandler({
    redis: { set: async (...args) => { calls.records.push(args); await save(...args); } },
    limiter: { limit: async (key) => { calls.keys.push(key); return limitResult; } },
    now: () => NOW,
    id: () => 'feedback-test-id',
    rateLimitSecret: 'test-only-secret',
  });
  return { handler, calls };
}

function request(body = validBody, options = {}) {
  const method = options.method ?? 'POST';
  return new Request('https://kabirui.example/api/feedback', {
    method,
    headers: {
      'Content-Type': options.contentType ?? 'application/json',
      'X-Forwarded-For': options.forwardedFor ?? '198.51.100.7',
      ...(options.vercelForwardedFor ? { 'X-Vercel-Forwarded-For': options.vercelForwardedFor } : {}),
    },
    ...(method === 'GET' || method === 'HEAD' ? {} : { body: options.rawBody ?? JSON.stringify(body) }),
  });
}

test('stores only the message and app version, and returns a simple acknowledgement', async () => {
  const { handler, calls } = fixture();
  const response = await handler(request({ ...validBody, message: '  The launcher feels great.  ' }, {
    forwardedFor: 'spoofed, 203.0.113.99', vercelForwardedFor: '198.51.100.7',
  }));
  const result = await response.json();

  assert.equal(response.status, 201);
  assert.deepEqual(result, { ok: true, message: 'Thanks for helping improve KabirUI.' });
  assert.equal(calls.records.length, 1);
  assert.equal(calls.records[0][0], 'kabirui:feedback:inbox:feedback-test-id');
  assert.deepEqual(calls.records[0][1], {
    message: 'The launcher feels great.', versionName: '4.0.0', versionCode: 12,
    receivedAt: '2026-10-18T11:00:00.000Z',
  });
  assert.equal(calls.records[0][2].ex, 365 * 24 * 60 * 60);
  assert.equal(calls.keys.length, 1);
  assert.match(calls.keys[0], /^[a-f0-9]{64}$/);
  assert.equal(calls.keys[0], createHmac('sha256', 'test-only-secret').update('198.51.100.7').digest('hex'));
  assert.doesNotMatch(calls.keys[0], /198\.51\.100\.7/);
});

test('rejects blank, oversized, malformed, and non-JSON submissions before storage', async () => {
  const { handler, calls } = fixture();
  assert.equal((await handler(request({ ...validBody, message: '  ' }))).status, 400);
  assert.equal((await handler(request({ ...validBody, message: 'x'.repeat(2_001) }))).status, 400);
  assert.equal((await handler(request({}, { rawBody: '{bad json' }))).status, 400);
  assert.equal((await handler(request(validBody, { contentType: 'text/plain' }))).status, 415);
  assert.equal((await handler(request(validBody, { rawBody: JSON.stringify({ ...validBody, message: 'x'.repeat(9_000) }) }))).status, 413);
  assert.equal(calls.records.length, 0);
  assert.equal(calls.keys.length, 0);
});

test('accepts five submissions, then rate limits the sixth and tells the app when to retry', async () => {
  let attempts = 0;
  const saved = [];
  const handler = createFeedbackHandler({
    redis: { set: async (...args) => saved.push(args) },
    limiter: { limit: async () => ({ success: ++attempts <= 5, reset: NOW + 45_000 }) },
    now: () => NOW,
    id: () => `feedback-${saved.length}`,
    rateLimitSecret: 'test-only-secret',
  });

  for (let attempt = 0; attempt < 5; attempt += 1) {
    assert.equal((await handler(request())).status, 201);
  }
  const blocked = await handler(request());
  assert.equal(blocked.status, 429);
  assert.equal(blocked.headers.get('Retry-After'), '45');
  assert.equal(saved.length, 5);
});

test('accepts POST only and fails closed when persistent storage is unavailable', async () => {
  const { handler } = fixture();
  assert.equal((await handler(request(undefined, { method: 'GET', rawBody: undefined }))).status, 405);
  const noStorage = createFeedbackHandler({ rateLimitSecret: 'secret' });
  const response = await noStorage(request());
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { ok: false, message: 'Feedback is temporarily unavailable.' });
});

test('does not report saved when Redis rejects the write', async () => {
  const { handler } = fixture({ save: async () => { throw new Error('private backend detail'); } });
  const response = await handler(request());
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { ok: false, message: 'Feedback is temporarily unavailable.' });
});
