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
- `rsconcept/rstool-mcp`: published MCP adapter (`@rsconcept/rstool-mcp`) wrapping `rstool`
- `scripts/dev`, `scripts/prod`, `nginx`, `docker-compose-*.yml`: ops/deploy
- `pnpm-workspace.yaml` + root `pnpm-lock.yaml`: JS/TS packages linked via `workspace:*`
- `.agents/skills/`: project agent skills (see below)

## Edit Rules

- Frontend code/routes/state/API hooks → `rsconcept/frontend`.
- Backend API/models/serializers/permissions/settings → `rsconcept/backend`.
- Frontend UI text: follow frontend i18n rules; keep `useTx`/`globalTx` ids and `en`/`ru`/`fr` slices synced.
- API contract changes: sync frontend/backend.

## Agent skills

- Terminology (agents): `rsconcept/rstool/docs/DOMAIN.md` §«Термины: не путать» — never «базис»/«базисы»; use **базисное множество** for `X#`, **неопределяемые понятия** for the `X#`/`C#`/`S#` layer.
- Portal REST (UI links → API): `rsconcept/rstool/docs/PORTAL-API.md`.

## Cursor Cloud

Bare-metal ports, SQLite bootstrap, and Cloud timing notes: [`.agents/CURSOR-CLOUD.md`](.agents/CURSOR-CLOUD.md). Prefer Docker/`README.md` when available.
