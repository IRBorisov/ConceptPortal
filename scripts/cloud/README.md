# Cloud agent dev stack

Helpers for Claude Code cloud sessions (and any bare-metal Linux box without Docker).
The SessionStart hook in `.claude/hooks/session-start.sh` runs `pnpm install`, builds `@rsconcept/domain`,
runs `uv sync`, and seeds `rsconcept/backend/db.sqlite3` via `seed-db.sh`.

| Command                                                        | What it does                                                                                                                 |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `scripts/cloud/dev.sh start`                                   | Starts Django on `:8000` (SQLite) and Vite on `:3000` in the background; waits until both answer.                            |
| `scripts/cloud/dev.sh status` / `stop`                         | Check or stop both servers. Logs: `/tmp/portal-backend.log`, `/tmp/portal-frontend.log`.                                     |
| `scripts/cloud/seed-db.sh`                                     | Migrates; on a fresh DB loads `fixtures/InitialData.json` and sets `admin` / `admin12345`. Delete `db.sqlite3` to reset.     |
| `node scripts/cloud/record-video.mjs <scenario.mjs> [out.mp4]` | Records a Playwright walkthrough of the running app to `.mp4` (+ `.webm`). Default output under `recordings/` (git-ignored). |

## Recording a video

A scenario is an ES module whose default export receives `{ page, baseURL, login, pause }`:

```js
export default async function ({ page, login, pause }) {
  await login(); // admin / admin12345 by default
  await page.getByText('Булева алгебра').click();
  await pause(2000);
}
```

See `scenarios/smoke.mjs`. Onboarding tour invitations are suppressed unless `VIDEO_SHOW_TOURS=1`. React Scan (render-highlight overlay) is off unless `VITE_REACT_SCAN=true` is set in `rsconcept/frontend/.env.local`.
Other env: `PORTAL_URL`, `VIDEO_WIDTH`, `VIDEO_HEIGHT`, `VIDEO_LOCALE` (default `ru-RU`).
On failure the script still writes the video, saves `<out>-failure.png`, and exits 1.

## Playwright browser

Cloud containers preinstall Chromium at `/opt/pw-browsers/chromium`, which may not match the pinned
`@playwright/test` revision, and `playwright install` is not available. The hook exports
`CHROMIUM_PATH`; both `record-video.mjs` and `rsconcept/frontend/playwright.config.ts` honor it, so
`pnpm --filter frontend run test:e2e` works without downloading browsers.
