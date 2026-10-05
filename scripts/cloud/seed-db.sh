#!/bin/bash
# Migrate the local SQLite DB (rsconcept/backend/db.sqlite3) and seed it with sample data if not seeded yet.
# Sample users from fixtures/InitialData.json; admin password is set to admin12345.
set -euo pipefail
cd "$(dirname "$0")/../../rsconcept/backend"

uv run python manage.py migrate --noinput
# Seed when the fixture's admin user is missing (fresh DB or an earlier partial run).
# loaddata is idempotent: fixture records carry primary keys and are overwritten in place.
seeded=$(echo "from django.contrib.auth import get_user_model as G; print(G().objects.filter(username='admin').exists())" \
  | uv run python manage.py shell 2>/dev/null | tail -n 1)
if [ "$seeded" != "True" ]; then
  uv run python manage.py loaddata fixtures/InitialData.json
  echo "from django.contrib.auth import get_user_model as G; u=G().objects.get(username='admin'); u.set_password('admin12345'); u.save()" \
    | uv run python manage.py shell
fi
