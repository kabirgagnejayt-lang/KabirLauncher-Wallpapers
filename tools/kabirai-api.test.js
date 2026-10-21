'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createHandler, MODEL, SUPPORTED_MODELS, ENDPOINT } = require('../api/kabirai');

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

function groqReply(reply, actions = []) {
  return { choices: [{ message: { content: JSON.stringify({ reply, actions }) } }] };
}

function okJson(reply = 'ok', actions = []) {
  return { ok: true, status: 200, json: async () => groqReply(reply, actions) };
}

test('offers only the two supported KabirCloud models and defaults to GPT-OSS 20B', () => {
  assert.deepEqual([...SUPPORTED_MODELS], ['openai/gpt-oss-20b', 'openai/gpt-oss-120b']);
  assert.equal(MODEL, 'openai/gpt-oss-20b');
});

test('rejects methods other than POST without calling Groq', async () => {
  let called = false;
  const handler = createHandler({ getApiKey: () => 'test-key', fetchImpl: async () => { called = true; } });
  const res = response();
  await handler(request('GET'), res);
  assert.equal(res.statusCode, 405);
  assert.equal(called, false);
});

test('serves a safe Groq deployment health check without calling the provider', async () => {
  let called = false;
  const handler = createHandler({ getApiKeys: () => ['secret-test-key'], fetchImpl: async () => { called = true; } });
  const res = response();
  const req = request('GET'); req.query = { health: '1' };
  await handler(req, res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { status: 'ready', provider: 'groq', models: ['openai/gpt-oss-20b', 'openai/gpt-oss-120b'] });
  assert.equal(called, false);

  const missing = response();
  await createHandler({ getApiKeys: () => '' })(Object.assign(request('GET'), { query: { health: '1' } }), missing);
  assert.equal(missing.body.status, 'missing_credentials');
  assert.equal(JSON.stringify(missing.body).includes('secret-test-key'), false);
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

test('uses the selected allow-listed model and returns sanitized actions', async () => {
  let outgoing;
  const handler = createHandler({
    getApiKey: () => 'server-only-key',
    fetchImpl: async (url, options) => {
      outgoing = { url, options, body: JSON.parse(options.body) };
      return okJson('I can open Spotify.', [
        { type: 'open_app', label: 'Open Spotify', query: 'Spotify', minutes: 999, repeatMinutes: 30, reminderText: 'ignored' },
        { type: 'reminder', label: 'In 20 minutes', minutes: 20, repeatMinutes: 20, reminderText: 'Stretch' },
        { type: 'unknown', label: 'bad action' },
      ]);
    },
  });
  const res = response();
  await handler(request('POST', { message: 'Open Spotify and remind me to stretch.', cloudModel: 'openai/gpt-oss-120b' }), res);
  assert.equal(res.statusCode, 200);
  assert.equal(outgoing.url, ENDPOINT);
  assert.equal(outgoing.options.headers.Authorization, 'Bearer server-only-key');
  assert.equal(outgoing.options.headers.Authorization.includes('server-only-key'), true);
  assert.equal(outgoing.url.includes('server-only-key'), false);
  assert.equal(outgoing.body.model, 'openai/gpt-oss-120b');
  assert.equal(outgoing.body.reasoning_effort, 'medium');
  assert.equal(outgoing.body.tools, undefined);
  assert.match(outgoing.body.messages[0].content, /Web search is off/);
  assert.equal(res.body.model, 'openai/gpt-oss-120b');
  assert.deepEqual(res.body.actions.map(action => action.type), ['open_app', 'reminder']);
  assert.deepEqual(res.body.actions[0], { type: 'open_app', label: 'Open Spotify', query: 'Spotify', minutes: 0, repeatMinutes: 0, reminderText: '' });
  assert.equal(res.body.actions[1].repeatMinutes, 20);
});

test('uses the 20B default for unknown model IDs and supports Groq browser search', async () => {
  let outgoingBody;
  const handler = createHandler({
    getApiKey: () => 'server-only-key',
    fetchImpl: async (_url, options) => { outgoingBody = JSON.parse(options.body); return okJson('A grounded answer [Example](https://news.example/story).'); },
  });
  const res = response();
  await handler(request('POST', { message: 'Search online for the latest launch news.', cloudModel: 'unsupported-model', stream: false, webSearch: true }), res);
  assert.equal(outgoingBody.model, 'openai/gpt-oss-20b');
  assert.equal(outgoingBody.reasoning_effort, 'low');
  assert.deepEqual(outgoingBody.tools, [{ type: 'browser_search' }]);
  assert.equal(outgoingBody.tool_choice, 'required');
  assert.match(outgoingBody.messages[0].content, /Browser search is available/);
  assert.deepEqual(res.body.sources, [{ title: 'Example', url: 'https://news.example/story' }]);
});

test('drops reminders that do not have a real future delay', async () => {
  const handler = createHandler({ getApiKey: () => 'test-key', fetchImpl: async () => okJson('How long from now?', [
    { type: 'reminder', label: 'Reminder', minutes: 0, repeatMinutes: 0 },
  ]) });
  const res = response();
  await handler(request('POST', { message: 'Remind me later.' }), res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body.actions, []);
});

test('streams Groq reply deltas and returns safe actions at the end', async () => {
  const pieces = ['{"reply":"Hello ', 'Kabir","actions":[]}'];
  const handler = createHandler({
    getApiKey: () => 'server-only-key',
    fetchImpl: async (url, options) => {
      assert.equal(url, ENDPOINT);
      assert.equal(options.headers.Authorization, 'Bearer server-only-key');
      assert.equal(JSON.parse(options.body).model, 'openai/gpt-oss-20b');
      const events = pieces.map(content => `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`);
      events.push('data: [DONE]\n\n');
      return { ok: true, status: 200, body: new ReadableStream({ start(controller) { events.forEach(event => controller.enqueue(new TextEncoder().encode(event))); controller.close(); } }) };
    },
  });
  const res = response();
  await handler(request('POST', { message: 'Say hello', stream: true }), res);
  assert.equal(res.headers['Content-Type'], 'text/event-stream; charset=utf-8');
  assert.equal(res.ended, true);
  const events = [...res.output.matchAll(/data: (\{.*?\})\n\n/g)].map(match => JSON.parse(match[1]));
  assert.deepEqual(events.filter(event => event.type === 'delta').map(event => event.text), ['Hello ', 'Kabir']);
  assert.equal(events.find(event => event.type === 'done').model, 'openai/gpt-oss-20b');
});

test('loads numbered Vercel credentials in numeric order and cycles requests', async () => {
  const auth = [];
  const handler = createHandler({
    env: { GROQ_API_KEY_10: 'key-10', GROQ_API_KEY_2: 'key-2', GROQ_API_KEY_1: 'key-1' },
    fetchImpl: async (_url, options) => { auth.push(options.headers.Authorization); return okJson(); },
  });
  for (let i = 0; i < 3; i++) { const res = response(); await handler(request('POST', { message: 'hello' }), res); assert.equal(res.statusCode, 200); }
  assert.deepEqual(auth, ['Bearer key-1', 'Bearer key-2', 'Bearer key-10']);
});

test('only cools down the key that received HTTP 429 for 60 seconds', async () => {
  let clock = 1_800_000_000_000;
  const used = [];
  let rejectedAlpha = false;
  const handler = createHandler({
    getApiKeys: () => ['alpha-secret', 'beta-secret'],
    now: () => clock,
    fetchImpl: async (_url, options) => {
      const auth = options.headers.Authorization;
      used.push(auth);
      if (auth === 'Bearer alpha-secret' && !rejectedAlpha) {
        rejectedAlpha = true;
        return { ok: false, status: 429, headers: { get: () => '60' }, json: async () => ({ error: { code: 'rate_limit_exceeded' } }) };
      }
      return okJson();
    },
  });
  const limited = response(); await handler(request('POST', { message: 'hello' }), limited);
  assert.equal(limited.statusCode, 429);
  assert.equal(limited.headers['Retry-After'], '60');
  for (let i = 0; i < 2; i++) { const res = response(); await handler(request('POST', { message: 'hello' }), res); assert.equal(res.statusCode, 200); }
  assert.deepEqual(used, ['Bearer alpha-secret', 'Bearer beta-secret', 'Bearer beta-secret']);
  clock += 60_001;
  const recovered = response(); await handler(request('POST', { message: 'hello' }), recovered);
  assert.equal(recovered.statusCode, 200);
  assert.equal(used.at(-1), 'Bearer alpha-secret');
});

test('rate limits bursts per forwarded client address', async () => {
  const handler = createHandler({ getApiKey: () => 'test-key', fetchImpl: async () => okJson() });
  let last;
  for (let i = 0; i < 16; i++) { last = response(); await handler(request('POST', { message: 'hello' }, '192.0.2.1'), last); }
  assert.equal(last.statusCode, 429);
});

test('fails closed in production when the shared rate-limit store is missing', async () => {
  let upstreamCalled = false;
  const handler = createHandler({
    env: { VERCEL: '1' }, getApiKey: () => 'test-key',
    fetchImpl: async () => { upstreamCalled = true; throw new Error('must not call'); },
  });
  const res = response();
  await handler(request('POST', { message: 'hello' }), res);
  assert.equal(res.statusCode, 503);
  assert.equal(res.body.error, 'KabirAI is temporarily unavailable. Its request protection is not configured.');
  assert.equal(upstreamCalled, false);
});

test('uses an atomic shared limiter and hashed client and key fingerprints in production', async () => {
  const redisUrl = 'https://redis.example.test';
  let requestCount = 0;
  const redisCommands = [];
  let modelCalls = 0;
  const handler = createHandler({
    env: { VERCEL: '1', UPSTASH_REDIS_REST_KV_REST_API_URL: redisUrl, UPSTASH_REDIS_REST_KV_REST_API_TOKEN: 'redis-test-token' },
    getApiKeys: () => ['server-only-key'],
    fetchImpl: async (url, options) => {
      if (url === redisUrl) {
        const command = JSON.parse(options.body); redisCommands.push(command);
        assert.equal(options.headers.Authorization, 'Bearer redis-test-token');
        if (command[0] === 'EVAL') return { ok: true, json: async () => ({ result: ++requestCount > 15 ? 0 : 1 }) };
        if (command[0] === 'TTL') return { ok: true, json: async () => ({ result: -2 }) };
        if (command[0] === 'SET') return { ok: true, json: async () => ({ result: 'OK' }) };
        throw new Error(`unexpected Redis command ${command[0]}`);
      }
      modelCalls++;
      return okJson();
    },
  });
  let last;
  for (let i = 0; i < 16; i++) { last = response(); await handler(request('POST', { message: 'hello' }, '192.0.2.88'), last); }
  assert.equal(last.statusCode, 429);
  assert.equal(requestCount, 16);
  assert.equal(modelCalls, 15);
  const limiter = redisCommands.find(command => command[0] === 'EVAL');
  assert.match(limiter[1], /ZREMRANGEBYSCORE/);
  assert.match(limiter[3], /^kabirai:ratelimit:[a-f0-9]{64}$/);
  assert.equal(JSON.stringify(limiter).includes('192.0.2.88'), false);
  const fingerprint = redisCommands.find(command => command[0] === 'TTL');
  assert.match(fingerprint[1], /^kabirai:groq:key-cooldown:[a-f0-9]{64}$/);
  assert.equal(JSON.stringify(redisCommands).includes('server-only-key'), false);
});
