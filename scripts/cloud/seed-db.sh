#!/bin/bash
# Create and seed the local SQLite DB (rsconcept/backend/db.sqlite3) if it does not exist yet.
# Sample users from fixtures/InitialData.json; admin password is set to admin12345.
set -euo pipefail
cd "$(dirname "$0")/../../rsconcept/backend"

fresh=0
[ -f db.sqlite3 ] || fresh=1
uv run python manage.py migrate --noinput
if [ "$fresh" = 1 ]; then
  uv run python manage.py loaddata fixtures/InitialData.json
  echo "from django.contrib.auth import get_user_model as G; u=G().objects.get(username='admin'); u.set_password('admin12345'); u.save()" \
    | uv run python manage.py shell
fi
