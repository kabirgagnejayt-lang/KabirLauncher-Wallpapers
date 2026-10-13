# KabirUI

Launcher landing page and wallpaper API on one Vercel site.

Website: https://kabirui.kabirinvents.com

GET /api/wallpapers returns the complete catalog, categories, available resolutions, dimensions, exact bytes, MB and download URLs. GET /api/categories returns categories. Dusk is the only built-in app wallpaper; the market fetches the catalog and downloads selected images.


GET /api/version returns the current launcher release from `version.json`. The Android launcher compares the numeric `versionCode` with its installed build, shows a dismissible banner for a newer release, and can show an important-update popup after `popupAfterDays`. A postponed popup returns after `popupReminderDays`.

For a release, set `versionName`, increase `versionCode`, and update `publishedAtMillis` in `version.json`. Use `importance: "normal"` for the banner or `"important"` for the delayed popup. Add release details to `releaseNotes`. Set `updateUrl` to the official HTTPS download page when it exists; while it is blank, the app shows the update notice without an Update button. Also update the Android app's `versionName` and `versionCode` in `app/build.gradle.kts` and publish the signed app build. For example, `0.10` to `0.11` should use a larger numeric `versionCode` (such as 10 to 11); the app compares codes rather than version text.
