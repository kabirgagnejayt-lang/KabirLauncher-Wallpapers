# KabirUI

Launcher landing page and wallpaper API on one Vercel site.

Website: https://kabirui.kabirinvents.com

GET /api/wallpapers returns the complete catalog, categories, available resolutions, dimensions, exact bytes, MB and download URLs. GET /api/categories returns categories. Dusk is the only built-in app wallpaper; the market fetches the catalog and downloads selected images.


GET /api/version returns the current launcher release from `version.json`. The Android launcher compares the numeric `versionCode` with its installed build, shows a dismissible banner for a newer release, and can show an important-update popup after `popupAfterDays`. A postponed popup returns after `popupReminderDays`.

For a release, set `versionName`, increase `versionCode`, and update `publishedAtMillis` in `version.json`. Use `importance: "normal"` for the banner or `"important"` for the delayed popup. Add release details to `releaseNotes`. Set `updateUrl` to the official HTTPS download page when it exists; while it is blank, the app shows the update notice without an Update button. Also update the Android app's `versionName` and `versionCode` in `app/build.gradle.kts` and publish the signed app build. For example, `0.10` to `0.11` should use a larger numeric `versionCode` (such as 10 to 11); the app compares codes rather than version text.


## Optional in-app feedback

The app waits 3 days after its first launch before asking for feedback. After each response or “Not now”, it waits 7 days for the next two prompts, then 14 days for later prompts. Submitting sends only the message and app version to `POST /api/feedback`; the API records those fields and a server timestamp in a private Vercel Blob object. There is no public feedback-list endpoint.

Before the endpoint can accept submissions, create a **private** Vercel Blob store for this project and connect it to the production environment so Vercel provides `BLOB_READ_WRITE_TOKEN`. Feedback records appear in that private store under `feedback/YYYY-MM-DD/`. The API returns an error if storage has not been connected; the app keeps the dialog open so a user can retry.
