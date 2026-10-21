'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createHandler, MODEL } = require('../api/kabirai');

function response() {
  return {
    headers: {}, statusCode: 200,
    setHeader(name, value) { this.headers[name] = value; return this; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
    flushHeaders() { this.headersSent = true; },
    write(chunk) { this.headersSent = true; this.output = (this.output || '') + chunk; },
    end() { this.ended = true; },
  };
}

function request(method = 'POST', body = {}, ip = '127.0.0.1') {
  return { method, body, headers: { 'x-forwarded-for': ip } };
}

test('rejects methods other than POST without calling Gemini', async () => {
  let called = false;
  const handler = createHandler({ getApiKey: () => 'test-key', fetchImpl: async () => { called = true; } });
  const res = response();
  await handler(request('GET'), res);
  assert.equal(res.statusCode, 405);
  assert.equal(called, false);
});

test('reports a missing server key without revealing or calling upstream', async () => {
  let called = false;
  const handler = createHandler({ getApiKey: () => '', fetchImpl: async () => { called = true; } });
  const res = response();
  await handler(request(), res);
  assert.equal(res.statusCode, 503);
  assert.equal(called, false);
});

test('rejects malformed and oversized prompts', async () => {
  const handler = createHandler({ getApiKey: () => 'test-key', fetchImpl: async () => { throw Error('should not call'); } });
  const missing = response(); await handler(request('POST', { message: ' ' }), missing);
  assert.equal(missing.statusCode, 400);
  const oversized = response(); await handler(request('POST', { message: 'x'.repeat(1801) }), oversized);
  assert.equal(oversized.statusCode, 400);
});

test('sends only the selected model and returns sanitized actions', async () => {
  let outgoing;
  const handler = createHandler({
    getApiKey: () => 'server-only-key',
    fetchImpl: async (url, options) => {
      outgoing = { url, options, body: JSON.parse(options.body) };
      return { ok: true, status: 200, json: async () => ({ candidates: [{ content: { parts: [{ text: JSON.stringify({
        reply: 'I can open Spotify.',
        actions: [
          { type: 'open_app', label: 'Open Spotify', query: 'Spotify', minutes: 999, repeatMinutes: 30, reminderText: 'ignored' },
          { type: 'reminder', label: 'In 20 minutes', query: 'ignored', minutes: 20, repeatMinutes: 20, reminderText: 'Stretch' },
          { type: 'unknown', label: 'bad action' },
        ],
      }) }] } }] }) };
    },
  });
  const res = response();
  await handler(request('POST', { message: 'Open Spotify and remind me to stretch every 20 minutes.' }), res);
  assert.equal(res.statusCode, 200);
  assert.equal(outgoing.url.includes(MODEL), true);
  assert.equal(outgoing.options.headers['x-goog-api-key'], 'server-only-key');
  assert.equal(outgoing.url.includes('server-only-key'), false);
  assert.equal(outgoing.body.generationConfig.responseMimeType, 'application/json');
  assert.deepEqual(res.body.actions.map(action => action.type), ['open_app', 'reminder']);
  assert.deepEqual(res.body.actions[0], { type: 'open_app', label: 'Open Spotify', query: 'Spotify', minutes: 0, repeatMinutes: 0, reminderText: '' });
  assert.equal(res.body.actions[1].repeatMinutes, 20);
});

test('drops reminders that do not have a real future delay', async () => {
  const handler = createHandler({
    getApiKey: () => 'test-key',
    fetchImpl: async () => ({ ok: true, status: 200, json: async () => ({ candidates: [{ content: { parts: [{ text: JSON.stringify({
      reply: 'How long from now should I remind you?',
      actions: [{ type: 'reminder', label: 'Reminder', minutes: 0, repeatMinutes: 0, reminderText: 'Reminder' }],
    }) }] } }] }) }),
  });
  const res = response();
  await handler(request('POST', { message: 'Remind me later.' }), res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body.actions, []);
});

test('streams Gemini reply deltas as they arrive and returns safe actions at the end', async () => {
  const pieces = ['{"reply":"Hello ', 'Kabir","actions":[]}'];
  let requestedUrl;
  const handler = createHandler({
    getApiKey: () => 'server-only-key',
    fetchImpl: async (url, options) => {
      requestedUrl = url;
      assert.equal(options.headers['x-goog-api-key'], 'server-only-key');
      assert.equal(options.body && JSON.parse(options.body).generationConfig.responseMimeType, 'application/json');
      const events = pieces.map(text => `data: ${JSON.stringify({ candidates: [{ content: { parts: [{ text }] } }] })}\n\n`);
      return {
        ok: true, status: 200,
        body: new ReadableStream({ start(controller) { events.forEach(event => controller.enqueue(new TextEncoder().encode(event))); controller.close(); } }),
      };
    },
  });
  const res = response();
  await handler(request('POST', { message: 'Say hello', stream: true }), res);
  assert.match(requestedUrl, /streamGenerateContent\?alt=sse/);
  assert.equal(res.headers['Content-Type'], 'text/event-stream; charset=utf-8');
  assert.equal(res.ended, true);
  const deltas = [...res.output.matchAll(/data: (\{.*?\})\n\n/g)].map(match => JSON.parse(match[1])).filter(event => event.type === 'delta').map(event => event.text);
  assert.deepEqual(deltas, ['Hello ', 'Kabir']);
  assert.match(res.output, /"type":"done"/);
});

test('rate limits bursts per forwarded client address', async () => {
  const handler = createHandler({ getApiKey: () => 'test-key', fetchImpl: async () => ({ ok: true, status: 200, json: async () => ({ candidates: [{ content: { parts: [{ text: '{"reply":"ok","actions":[]}' }] } }] }) }) });
  let last;
  for (let i = 0; i < 16; i++) { last = response(); await handler(request('POST', { message: 'hello' }, '192.0.2.1'), last); }
  assert.equal(last.statusCode, 429);
});

test('fails closed in production when the shared rate-limit store is missing', async () => {
  let upstreamCalled = false;
  const handler = createHandler({
    env: { VERCEL: '1' },
    getApiKey: () => 'test-key',
    fetchImpl: async () => { upstreamCalled = true; throw new Error('must not call'); },
  });
  const res = response();
  await handler(request('POST', { message: 'hello' }), res);
  assert.equal(res.statusCode, 503);
  assert.equal(res.body.error, 'KabirAI is temporarily unavailable. Its request protection is not configured.');
  assert.equal(upstreamCalled, false);
});

test('uses an atomic shared limiter in production and hashes client addresses', async () => {
  const redisUrl = 'https://redis.example.test';
  let count = 0;
  let redisCommand;
  let modelCalls = 0;
  const handler = createHandler({
    env: { VERCEL: '1', UPSTASH_REDIS_REST_KV_REST_API_URL: redisUrl, UPSTASH_REDIS_REST_KV_REST_API_TOKEN: 'redis-test-token' },
    getApiKey: () => 'server-only-key',
    fetchImpl: async (url, options) => {
      if (url === redisUrl) {
        redisCommand = JSON.parse(options.body);
        assert.equal(options.headers.Authorization, 'Bearer redis-test-token');
        count++;
        return { ok: true, json: async () => ({ result: count > 15 ? 0 : 1 }) };
      }
      modelCalls++;
      return { ok: true, status: 200, json: async () => ({ candidates: [{ content: { parts: [{ text: '{"reply":"ok","actions":[]}' }] } }] }) };
    },
  });
  let last;
  for (let i = 0; i < 16; i++) { last = response(); await handler(request('POST', { message: 'hello' }, '192.0.2.88'), last); }
  assert.equal(last.statusCode, 429);
  assert.equal(count, 16);
  assert.equal(modelCalls, 15);
  assert.equal(redisCommand[0], 'EVAL');
  assert.match(redisCommand[1], /ZREMRANGEBYSCORE/);
  assert.match(redisCommand[3], /^kabirai:ratelimit:[a-f0-9]{64}$/);
  assert.equal(JSON.stringify(redisCommand).includes('192.0.2.88'), false);
});
