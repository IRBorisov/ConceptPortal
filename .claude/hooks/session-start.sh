#!/bin/bash
# SessionStart hook for Claude Code cloud sessions: installs JS/Python deps and seeds a local SQLite DB
# so agents can run tests, linters and the dev stack (scripts/cloud/dev.sh) without manual setup.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

corepack enable >/dev/null 2>&1 || true
pnpm install
pnpm --filter @rsconcept/domain run build

cd rsconcept/backend
uv sync
bash "$CLAUDE_PROJECT_DIR/scripts/cloud/seed-db.sh"

# Preinstalled Chromium may not match the pinned @playwright/test revision; point tools at it.
if [ -x /opt/pw-browsers/chromium ] && [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  echo 'export CHROMIUM_PATH=/opt/pw-browsers/chromium' >> "$CLAUDE_ENV_FILE"
fi
