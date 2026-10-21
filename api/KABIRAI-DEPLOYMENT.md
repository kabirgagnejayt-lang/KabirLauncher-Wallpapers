# KabirAI cloud deployment notes

`api/kabirai.js` serves `/api/kabirai` and proxies to Groq. Provider credentials stay on the server; never put them in Android, the APK, source control, or public client configuration.

## Server environment

- `GROQ_API_KEYS` — optional comma or newline separated list of Groq API keys.
- `GROQ_API_KEY_1`, `GROQ_API_KEY_2`, … — alternatively, numbered Vercel variables; read in numeric order.
- `GROQ_API_KEY` — single-key fallback when the list is empty.
- `GROQ_MODEL` — optional default model when the app sends no selection. Default: `openai/gpt-oss-20b`.
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` — required shared rate-limit store. Vercel's Upstash variable names ending in `_KV_REST_API_URL` and `_KV_REST_API_TOKEN` are also accepted.

In production, the handler fails closed if the shared limiter is missing or unavailable. It limits each forwarded client address to 15 requests per rolling minute and hashes the address before using it as a Redis key. Keep all provider keys private.

## Key rotation and quota behavior

The configured key list is deduplicated and rotated round-robin across incoming requests. If Groq rejects a credential with HTTP 401 or 403, the backend tries the next configured key. A key that receives HTTP 429 is paused for 60 seconds; the remaining configured keys stay eligible. Upstash stores the cooldown under a SHA-256 key fingerprint so the raw API key is not used as a Redis key. Network and capacity errors do not trigger key failover.

Groq documents rate limits at the organization level rather than per API key. Multiple keys in one organization do not add quota; per-key cooldown only prevents repeatedly sending a request with a key that was rejected. If the organization is still limited, other keys can receive the same response and will each be paused independently.

## Model and browser search

KabirCloud offers `openai/gpt-oss-20b` for faster everyday questions and `openai/gpt-oss-120b` for more involved reasoning. The server only accepts these allow-listed choices from the Android app. Both models support Groq's `browser_search` tool. The API requests browser search when enabled and the user explicitly asks a web/current-information question. Search citations are retained as safe HTTP/HTTPS links from the returned answer.

## Provider eligibility hold

Groq's published [Services Agreement](https://console.groq.com/docs/legal/services-agreement) currently says its Groq Cloud and AI Model Services are not for consumer use and requires users to be at least 18. KabirAI is designed for a consumer launcher, so this provider configuration is a development preview and is not cleared for public consumer release under those terms. Confirm applicable provider terms or select a service whose terms permit the intended audience before public release.

The Android app currently points to `https://kabirui.kabirinvents.com/api/kabirai`. No Groq keys are configured by this change. Confirm the route, server variables, provider eligibility, and a live streaming request on the actual deployment before release. Do not claim production readiness while those checks remain outstanding.

## Local checks

Run `node --test tools/kabirai-api.test.js tools/kabirai-http.test.js` from the website project to verify the proxy contract. No live provider call or deployment is performed by local source changes.

`GET /api/kabirai?health=1` is a no-prompt deployment check. It returns the provider, supported model IDs, and whether credentials are configured, without returning any credential or calling Groq. Older deployments return HTTP 405, which means the API update has not been deployed yet.
