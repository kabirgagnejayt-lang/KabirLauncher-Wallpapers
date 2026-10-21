# KabirUI

Launcher landing page and wallpaper API on one Vercel site.

Website: https://kabirui.kabirinvents.com

GET /api/wallpapers returns the complete catalog, categories, available resolutions, dimensions, exact bytes, MB and download URLs. GET /api/categories returns categories. Dusk is the only built-in app wallpaper; the market fetches the catalog and downloads selected images.

The current catalog contains 93 scenes: Dusk is built in and the other 92 are downloadable from the market. Ten new AMOLED space scenes are also bundled in KabirUI 4.1.0 for offline previews and applying. Each catalog scene has 720p, 1080p, 2K and 4K WebP variants. KabirUI now includes 58 clock and 58 battery widget designs; keep the Android wallpaper test fixture synchronized with `wallpapers.json` when changing this catalog.

Use `assets/kabirui-mark.png` for favicon, home-screen, and compact header-icon slots. The adjacent `KabirUI` text is the readable page-header wordmark; retain `assets/kabirui-icon.png` as the original wordmark artwork.

The shared brand palette is pine `#0A0F0D`, app surface `#101614`, cream `#F4F6F3`, mint `#D5E8BE`, and blue `#BCDFF2`. Keep the site tokens aligned with `FocusedUi.kt` and the launcher's default palette in `IconFeatures.kt`.

Keep Ko-fi as a direct user-opened link rather than embedding its widget. This keeps the support section available when third-party framing is blocked and avoids contacting Ko-fi until the visitor chooses to open it.


GET /api/version returns the current launcher release from `version.json`. The Android launcher compares the numeric `versionCode` with its installed build, shows a dismissible banner for a newer release, and can show an important-update popup after `popupAfterDays`. A postponed popup returns after `popupReminderDays`.

For a release, set `versionName`, increase `versionCode`, and update `publishedAtMillis` in `version.json`. Use `importance: "normal"` for the banner or `"important"` for the delayed popup. Add release details to `releaseNotes`. Set `updateUrl` to the official HTTPS download page when it exists; while it is blank, the app shows the update notice without an Update button. Also update the Android app's `versionName` and `versionCode` in `app/build.gradle.kts` and publish the signed app build. For example, `0.10` to `0.11` should use a larger numeric `versionCode` (such as 10 to 11); the app compares codes rather than version text.

## KabirAI preview API

`api/kabirai.js` proxies requests to Groq and streams replies to the Android app. KabirCloud offers GPT-OSS 20B (default, faster) and GPT-OSS 120B (more reasoning); the app sends the selected model and the server accepts only those two model IDs. Keep provider keys on the server; never add them to Android resources, Gradle configuration, app assets, or client-side configuration.

Production deployment requires these server-side environment variables:

- `GROQ_API_KEYS` (comma/newline separated key pool), `GROQ_API_KEY_1` through numbered variables, or `GROQ_API_KEY` (single-key fallback)
- Optional `GROQ_MODEL` (default model when no valid choice is sent)
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

The shared Upstash limiter is required in production. The handler fails closed when the limiter is not configured. Both GPT-OSS choices support Groq's `browser_search` tool when enabled. Keys rotate round-robin; an invalid credential tries the next key. A key that receives HTTP 429 is individually paused for 60 seconds, and other configured keys remain eligible. The cooldown key is a SHA-256 fingerprint, not the secret. After configuring the server environment and confirming provider eligibility, check `GET /api/kabirai?health=1` for deployment status and a streaming `POST /api/kabirai` for chat. Other GET requests return HTTP 405.

Run the backend contract checks with `node --test tools/kabirai-api.test.js tools/kabirai-http.test.js` from this website project.

**Provider terms currently block a public consumer release.** Groq's published [Services Agreement](https://console.groq.com/docs/legal/services-agreement) currently says its cloud and AI model services are not for consumer use and requires users to be at least 18. KabirAI is designed for a consumer launcher, so this configuration remains a development preview and is not cleared for public release under those terms. Confirm an applicable agreement or choose a provider whose terms permit the intended audience before release. No Groq keys or deployment changes are included in this source update.
