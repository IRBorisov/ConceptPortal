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

## Portal URLs → REST API

The portal UI and the API are on **different hosts** in production (see `nginx/production.conf`):

- **UI:** `https://portal.acconcept.ru/...`
- **API:** `https://api.portal.acconcept.ru` (Django; all app routes are under `/api/...` unless noted)

**Rewrite rules (keep `id` numeric; drop hash-style UI query params like `?tab=` unless the backend documents them):**

- `/rsforms/:id` → `GET /api/rsforms/:id` (library item metadata). Full RSForm payload: `GET /api/rsforms/:id/details` or `GET /api/library/:id/versions/:version`.
- `/oss/:id` → `GET /api/oss/:id` (and related OSS endpoints).
- `/models/:id` → `GET /api/models/:id` (RSModel router).

**Machine-readable OpenAPI:** `GET https://api.portal.acconcept.ru/schema` (Swagger UI root on the API host is separate; prefer `/schema` for JSON).

Locally, the **path prefix stays `/api/...`**; the API base URL comes from `VITE_PORTAL_BACKEND` (`rsconcept/frontend/src/utils/build-constants.ts`).

## Edit Rules

- Frontend code/routes/state/API hooks -> `rsconcept/frontend`.
- Backend API/models/serializers/permissions/settings -> `rsconcept/backend`.
- Frontend UI text: follow frontend i18n rules; keep `useTx`/`globalTx` ids and `en`/`ru`/`fr` slices synced.
- API contract changes: sync frontend/backend.

## Agent skills

- Domain docs: `CONTEXT.md`.
- **Project skills:** `.agents/skills/<name>/`
- **`rstool-helper`:** canonical guide in `rsconcept/rstool/skills/rstool-helper/` + `rsconcept/rstool/docs/`; workspace entry skill `.agents/skills/rstool-helper/SKILL.md`.
