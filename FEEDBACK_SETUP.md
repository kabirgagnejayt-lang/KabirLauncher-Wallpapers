# KabirUI feedback backend setup

The Android client submits JSON to /api/feedback. The Vercel function validates each request, applies an hourly limit, and calls a private Supabase function. It does not accept email addresses, screenshots, device identifiers, or arbitrary extra fields.

## Configure Supabase

1. Create a dedicated Supabase project for KabirUI feedback.
2. Open the project's SQL editor and run supabase/feedback.sql.
3. Confirm that kabirui_feedback and kabirui_feedback_rate_limit have row-level security enabled and that only service_role can execute the submission function.
4. Check that the two pg_cron jobs exist: feedback retention (12 months) and rate-limit cleanup (2 hours).

The feedback table contains the submission type, optional 1–5 rating, comment or bug description, optional reproduction steps, app version, locale, and submission time. The rate-limit table contains only an HMAC of the request address and timestamps needed for a rolling five-per-hour limit. Raw addresses and client/device IDs are not sent to Supabase.

## Configure Vercel

Set these environment variables in the Vercel project for every deployment target that should accept feedback:

- SUPABASE_URL: the dedicated project's HTTPS URL.
- SUPABASE_SECRET_KEY: its server-only Supabase Secret API key (`sb_secret_...`). Never put it in the Android app or a public web variable.
- FEEDBACK_IP_HASH_SECRET: a random secret of at least 32 characters. Generate one with: node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"

Deploy the website project after setting the variables. The function returns a success response only after Supabase confirms that the row was stored. Until the Vercel variables and database function are configured, it returns a service-unavailable response and the app keeps the user's draft.

This rate limit expects the request to reach Vercel directly so its overwritten X-Forwarded-For header contains the actual client address. If a separate proxy is placed in front of Vercel, configure edge-level rate limiting and verify the trusted address source before launch.

## Release checks

- Run the API checks with node --test tests/feedback-api.test.js.
- Run the app feedback unit tests with .\gradlew.bat :app:testDebugUnitTest --tests com.kabirinvents.kabirlauncher.LauncherFeedbackTest.
- Submit a rating with and without a comment, then submit a bug report with and without reproduction steps.
- Confirm both rows appear in the Supabase dashboard with the expected type and metadata.
- Confirm the sixth request from one address in an hour is rate-limited.
- Confirm direct table access is denied to anon and authenticated.
- Verify the retention and rate-limit cleanup jobs are scheduled and running.
- Update the Play Console Data Safety answers before publishing, including user-provided feedback, app version/locale, and server-side connection processing.

