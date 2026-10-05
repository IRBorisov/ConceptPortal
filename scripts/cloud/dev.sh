#!/bin/bash
# Start/stop the bare-metal dev stack: Django on :8000 (SQLite), Vite on :3000.
# Usage: scripts/cloud/dev.sh start|stop|status   Logs: /tmp/portal-backend.log, /tmp/portal-frontend.log
set -euo pipefail
root="$(cd "$(dirname "$0")/../.." && pwd)"

up() { curl -s -o /dev/null --max-time 2 "$1"; }

start() {
  if ! up http://localhost:8000/; then
    (cd "$root/rsconcept/backend" && nohup uv run python manage.py runserver 0.0.0.0:8000 >/tmp/portal-backend.log 2>&1 &)
  fi
  if ! up http://localhost:3000/; then
    (cd "$root" && nohup pnpm --filter frontend run dev >/tmp/portal-frontend.log 2>&1 &)
  fi
  for _ in $(seq 1 60); do
    up http://localhost:8000/ && up http://localhost:3000/ && { status; return 0; }
    sleep 1
  done
  status
  echo "Timed out; see /tmp/portal-backend.log and /tmp/portal-frontend.log" >&2
  return 1
}

stop() {
  pkill -f '[m]anage.py runserver' || true
  pkill -f 'node.*[v]ite' || true
}

status() {
  up http://localhost:8000/ && echo "backend  up   http://localhost:8000" || echo "backend  down"
  up http://localhost:3000/ && echo "frontend up   http://localhost:3000" || echo "frontend down"
}

"${1:-start}"
