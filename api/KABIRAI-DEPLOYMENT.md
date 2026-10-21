# KabirAI deployment checklist

`api/kabirai.js` serves `/api/kabirai` and keeps the Gemini credential on the server. Never add provider credentials to the Android project, APK, or public client configuration.

## Required server variables

- `GEMINI_API_KEY` — server-side model credential.
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` — shared rate-limit store endpoint and private token.
- The Vercel Upstash integration names the same credentials `UPSTASH_REDIS_REST_KV_REST_API_URL` and `UPSTASH_REDIS_REST_KV_REST_API_TOKEN`; the handler accepts either naming scheme.

Production fails closed if the shared rate-limit store is missing or unavailable. Local tests can use the in-memory limiter. The shared store limits each forwarded client address to 15 requests per rolling minute; client addresses are hashed before being used as Redis keys.

## Provider eligibility hold

The current model is `gemini-3.5-flash-lite`. Google's [Gemini API Additional Terms](https://ai.google.dev/gemini-api/terms) currently say the API is for professional or business purposes, not consumer use, and require users to be at least 18. KabirAI is designed as a consumer launcher feature, so this configuration is a development preview and is not cleared for public consumer release. Select a provider and terms that permit the intended audience, or obtain an applicable agreement, before enabling it publicly.

The Android app currently points to `https://kabirui.kabirinvents.com/api/kabirai`; that live route previously returned 404. Confirm the route and all required environment variables on the actual deployment before a release. Do not call the feature production-ready until a real streaming request succeeds through the deployed route.

## Local checks

Run `node --test tools/kabirai-api.test.js tools/kabirai-http.test.js`. These tests use fake upstream and rate-limit responses, including an HTTP-level SSE smoke test; they do not verify a live deployment or provider credentials.
