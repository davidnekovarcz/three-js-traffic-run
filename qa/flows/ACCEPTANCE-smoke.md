# Traffic Run — Kaloko score smoke

Local Vite only (`http://localhost:5176`). Ports 5173 and 5174 are already used by other Vite apps in this workspace. Production is readonly and is not walked.

Sign the dedicated test Gmail in once with `npx kaloko auth save --env local --account player`. Kaloko stores that browser session under `tmp/kaloko/.auth/` (gitignored) and loads it for this walk. A fresh walk clears the shared Chrome profile, so the saved session is what the account chooser uses. The password is not stored in this repo.

## Smoke — play, lose, save (`smoke-score.yml`)

1. Open the local game.
2. Hold accelerate so the car starts and runs into traffic. Laps may stay 0.
3. Wait for `#results`.
4. Click `#sign-in-button` and accept the test Google account if the chooser appears.
5. Expect `#retry-button` visible. That button is shown only after the Google name is saved with the score.
