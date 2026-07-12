# AGENTS.md

Workspace rules for agents.

## Scope

- Applies repo-wide unless nearer `AGENTS.md` exists.

## Structure

- `README.md`: setup/conventions/run docs
- `rsconcept/domain`: published TypeScript domain package (`@rsconcept/domain`)
- `rsconcept/frontend`: Vite React TS app
- `rsconcept/backend`: Django backend
- `rsconcept/rstool`: published agent library (`@rsconcept/rstool`) and stdio wrapper
- `rsconcept/rstool-mcp`: published MCP adapter (`@rsconcept/rstool-mcp`) wrapping `rstool` for Cursor/Claude
- `scripts/dev`: local lint/test/start scripts
- `scripts/prod`: deploy scripts
- `nginx`: reverse proxy/deploy config
- `docker-compose-*.yml`: containers
- `pnpm-workspace.yaml` + root `pnpm-lock.yaml`: JS/TS packages (`domain`, `frontend`, `rstool`, `rstool-mcp`) linked via `workspace:*`
- `.agents/skills/`: project agent skills for Cursor (see [Agent skills](#agent-skills))

## Edit Rules

- Frontend code/routes/state/API hooks -> `rsconcept/frontend`.
- Backend API/models/serializers/permissions/settings -> `rsconcept/backend`.
- Frontend UI text: follow frontend i18n rules; keep `useTx`/`globalTx` ids and `en`/`ru`/`fr` slices synced.
- API contract changes: sync frontend/backend.

## Agent skills

- Domain docs: `CONTEXT.md`.
- Portal REST API (UI links → API paths): `rsconcept/rstool/docs/PORTAL-API.md`.
- Conceptual-schema terminology (agents): `rsconcept/rstool/docs/DOMAIN.md` section **«Термины: не путать»** — never say «базис»/«базисы»; use **базисное множество** for `X#`, **неопределяемые понятия** for the `X#`/`C#`/`S#` layer.
- **Project skills:** `.agents/skills/<name>/`
- **`rstool-helper`:** canonical guide in `rsconcept/rstool/skills/rstool-helper/` + `rsconcept/rstool/docs/`; workspace entry skill `.agents/skills/rstool-helper/SKILL.md`.

## Cursor Cloud specific instructions

The startup update script already runs `pnpm install`, builds `@rsconcept/domain`, and syncs backend deps with `uv`. Node 22 (pre-installed) works fine even though the README says Node 24. Standard commands live in `README.md`, root `package.json`, and `rsconcept/backend/AGENTS.md`; the notes below are the non-obvious bits.

### Dev stack (no Docker required)

Docker is NOT installed here. Run the stack bare-metal instead of via `docker-compose-dev.yml`:

- Backend (Django, SQLite): from `rsconcept/backend`, `uv run python manage.py runserver 0.0.0.0:8000`. With no `DB_ENGINE` set it uses `db.sqlite3` (not Postgres). `runserver`/`test`/`migrate` are treated as safe local contexts, so `DEBUG` defaults to `True`, which makes DRF permissions `AllowAny` and enables CORS/CSRF for `http://localhost:3000`.
- Frontend (Vite): from repo root, `pnpm --filter frontend run dev`. It reads `rsconcept/frontend/.env.local`, so it serves on port **3000** and targets the backend at `http://localhost:8000` (NOT the Docker ports 3002/8002). Keep backend on 8000 and frontend on 3000 so CORS/CSRF and the API base URL line up out of the box.
- The frontend needs `@rsconcept/domain`'s built `dist/` (the update script builds it). After editing `rsconcept/domain`, rebuild with `pnpm --filter @rsconcept/domain run build` (or run `pnpm --filter @rsconcept/domain run dev` to watch) for Vite to pick up changes.

### First-run database setup (not in the update script)

The SQLite DB and its data are not guaranteed to persist. To (re)create a working dev DB from `rsconcept/backend`:

```
uv run python manage.py migrate
uv run python manage.py loaddata fixtures/InitialData.json
```

The fixture seeds a superuser `admin` (plus `User1`/`User2`/`User3`) with unknown passwords. To log in via the UI, set a known password, e.g.:

```
echo "from django.contrib.auth import get_user_model as G; u=G().objects.get(username='admin'); u.set_password('admin12345'); u.save()" | uv run python manage.py shell
```

### Lint / test / build

Commands are documented in `rsconcept/backend/AGENTS.md` and `rsconcept/frontend/AGENTS.md`. Frontend lint (`pnpm --filter frontend run lint`) and full backend test/lint take tens of seconds; that is normal.
