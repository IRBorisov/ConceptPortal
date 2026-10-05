#!/bin/bash
# Start/stop the bare-metal dev stack: Django on :8000 (SQLite), Vite on :3000.
# Usage: scripts/cloud/dev.sh start|stop|status   Logs: /tmp/portal-backend.log, /tmp/portal-frontend.log
# stop only kills the process groups this script started (tracked in /tmp/portal-*.pid).
set -euo pipefail
root="$(cd "$(dirname "$0")/../.." && pwd)"

up() { curl -s -o /dev/null --max-time 2 "$1"; }

# launch <name> <dir> <command...>: run in a new session so the whole process tree can be stopped together.
launch() {
  local name=$1 dir=$2
  shift 2
  # The session leader records its own PID (setsid may fork, so $! would be wrong).
  (cd "$dir" && setsid bash -c 'echo $$ >"$0"; exec "$@"' "/tmp/portal-$name.pid" "$@" \
    >"/tmp/portal-$name.log" 2>&1 </dev/null &)
}

start() {
  up http://localhost:8000/ || launch backend "$root/rsconcept/backend" uv run python manage.py runserver 0.0.0.0:8000
  up http://localhost:3000/ || launch frontend "$root" pnpm --filter frontend run dev
  for _ in $(seq 1 60); do
    up http://localhost:8000/ && up http://localhost:3000/ && { status; return 0; }
    sleep 1
  done
  status
  echo "Timed out; see /tmp/portal-backend.log and /tmp/portal-frontend.log" >&2
  return 1
}

stop() {
  local name pid
  for name in backend frontend; do
    if [ -f "/tmp/portal-$name.pid" ]; then
      pid=$(cat "/tmp/portal-$name.pid")
      kill -- "-$pid" 2>/dev/null || true
      rm -f "/tmp/portal-$name.pid"
    fi
  done
}

status() {
  up http://localhost:8000/ && echo "backend  up   http://localhost:8000" || echo "backend  down"
  up http://localhost:3000/ && echo "frontend up   http://localhost:3000" || echo "frontend down"
}

"${1:-start}"
