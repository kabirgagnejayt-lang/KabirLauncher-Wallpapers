'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createServer } = require('node:http');
const { once } = require('node:events');
const { createHandler, MODEL } = require('../api/kabirai');

async function openHandler(handler) {
  const server = createServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const rawBody = Buffer.concat(chunks).toString('utf8');
    if (rawBody) {
      try { req.body = JSON.parse(rawBody); }
      catch { req.body = rawBody; }
    }

    // Vercel's Node response helpers aren't part of Node's bare HTTP server.
    res.status = code => { res.statusCode = code; return res; };
    res.json = body => {
      if (!res.headersSent) res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(body));
      return res;
    };

    await handler(req, res);
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  return {
    url: `http://127.0.0.1:${server.address().port}/api/kabirai`,
    close: () => new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())),
  };
}

test('serves a complete SSE reply and sanitized app action over HTTP', async () => {
  const upstreamChunks = [
    '{"reply":"Hello ',
    'Kabir","actions":[{"type":"open_app","label":"Open Spotify","query":"Spotify","minutes":30,"repeatMinutes":20,"reminderText":"ignored"}]}',
  ];
  const handler = createHandler({
    env: {},
    getApiKey: () => 'server-only-test-key',
    fetchImpl: async (url, options) => {
      assert.equal(url, 'https://api.groq.com/openai/v1/chat/completions');
      assert.equal(options.headers.Authorization, 'Bearer server-only-test-key');
      assert.equal(JSON.parse(options.body).model, 'openai/gpt-oss-20b');
      const chunks = upstreamChunks.map(content => `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`);
      chunks.push('data: [DONE]\n\n');
      return {
        ok: true,
        status: 200,
        body: new ReadableStream({ start(controller) { chunks.forEach(chunk => controller.enqueue(new TextEncoder().encode(chunk))); controller.close(); } }),
      };
    },
  });
  const server = await openHandler(handler);
  try {
    const response = await fetch(server.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Open Spotify', stream: true }),
    });
    const output = await response.text();
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type'), 'text/event-stream; charset=utf-8');
    assert.match(output, /event: delta/);
    assert.match(output, /Hello Kabir/);
    assert.match(output, /"type":"done"/);
    assert.match(output, /"query":"Spotify"/);
    assert.match(output, new RegExp(`"model":"${MODEL}"`));
    assert.equal(output.includes('server-only-test-key'), false);
  } finally {
    await server.close();
  }
});

test('returns the real HTTP 405 contract without touching the model', async () => {
  let upstreamCalled = false;
  const server = await openHandler(createHandler({
    env: {},
    getApiKey: () => 'server-only-test-key',
    fetchImpl: async () => { upstreamCalled = true; throw new Error('unexpected upstream call'); },
  }));
  try {
    const response = await fetch(server.url);
    assert.equal(response.status, 405);
    assert.equal(response.headers.get('allow'), 'POST');
    assert.equal((await response.json()).error, 'Use POST for KabirAI.');
    assert.equal(upstreamCalled, false);
  } finally {
    await server.close();
  }
});

test('reports the deployed cloud provider over a no-prompt health request', async () => {
  let upstreamCalled = false;
  const server = await openHandler(createHandler({
    env: {},
    getApiKey: () => 'server-only-test-key',
    fetchImpl: async () => { upstreamCalled = true; throw new Error('unexpected upstream call'); },
  }));
  try {
    const response = await fetch(`${server.url}?health=1`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: 'ready', provider: 'groq', models: ['openai/gpt-oss-20b', 'openai/gpt-oss-120b'] });
    assert.equal(upstreamCalled, false);
  } finally {
    await server.close();
  }
});
