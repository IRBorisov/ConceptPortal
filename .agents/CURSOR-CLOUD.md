# Cursor Cloud / bare-metal local stack

Ops notes for agents and humans when Docker is unavailable (typical Cursor Cloud VM). Day-to-day commands: `README.md`, root `package.json`, package `AGENTS.md`.

## Bootstrap

The Cloud update script usually runs `pnpm install`, builds `@rsconcept/domain`, and syncs backend deps with `uv`. Node 22 works even if README lists Node 24.

## Dev stack (no Docker)

- **Backend** (Django, SQLite): from `rsconcept/backend`, `uv run python manage.py runserver 0.0.0.0:8000`. With no `DB_ENGINE` it uses `db.sqlite3`. `runserver` / `test` / `migrate` are safe local contexts → `DEBUG` defaults to `True` (DRF `AllowAny`, CORS/CSRF for `http://localhost:3000`).
- **Frontend** (Vite): from repo root, `pnpm --filter frontend run dev`. Reads `rsconcept/frontend/.env.local` → port **3000**, API `http://localhost:8000` (not Docker ports 3002/8002). Keep that pairing.
- After editing `rsconcept/domain`, rebuild: `pnpm --filter @rsconcept/domain run build` (or `run dev` to watch).

## First-run database

SQLite may not persist. From `rsconcept/backend`:

```
uv run python manage.py migrate
uv run python manage.py loaddata fixtures/InitialData.json
```

Fixture seeds `admin` / `User1`–`User3` with unknown passwords. Set a known password, e.g.:

```
echo "from django.contrib.auth import get_user_model as G; u=G().objects.get(username='admin'); u.set_password('admin12345'); u.save()" | uv run python manage.py shell
```

## Lint / test timing

Frontend lint and full backend test/lint often take tens of seconds; that is normal.
