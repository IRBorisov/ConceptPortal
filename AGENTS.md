# AGENTS.md

Workspace rules for agents.

## Scope

- Applies repo-wide unless nearer `AGENTS.md` exists.
- Read nearest rules before editing: `rsconcept/domain/AGENTS.md`, `rsconcept/frontend/AGENTS.md`, `rsconcept/backend/AGENTS.md`, `rsconcept/rstool/AGENTS.md`.

## Structure

- `README.md`: setup/conventions/run docs
- `package.json`: npm workspaces root for `rsconcept/*` packages
- `rsconcept/domain`: published TypeScript domain package (`@rsconcept/domain`) shared by frontend and rstool
- `rsconcept/frontend`: Vite React TS app
- `rsconcept/backend`: Django backend
- `rsconcept/rstool`: published agent library (`@rsconcept/rstool`) and stdio wrapper
- `rsconcept/rstool-mcp`: published MCP adapter (`@rsconcept/rstool-mcp`) wrapping `rstool` for Cursor/Claude
- `scripts/dev`: local lint/test/start scripts
- `scripts/prod`: deploy scripts
- `nginx`: reverse proxy/deploy config
- `docker-compose-*.yml`: containers
- `.agents/skills/`: project agent skills for Cursor (see [Agent skills](#agent-skills))

## Portal URLs → REST API

The portal UI and the API are on **different hosts** in production (see `nginx/production.conf`):

- **UI:** `https://portal.acconcept.ru/...`
- **API:** `https://api.portal.acconcept.ru` (Django; all app routes are under `/api/...` unless noted)

**Rewrite rules (keep `id` numeric; drop hash-style UI query params like `?tab=` unless the backend documents them):**

| Portal path | Typical REST target on API host |
|-------------|--------------------------------|
| `/rsforms/:id` … | `GET /api/rsforms/:id` — library item metadata (`owner`, titles, etc.). For the full RSForm payload the SPA uses `GET /api/rsforms/:id/details` (or `GET /api/library/:id/versions/:version` when a version is selected). |
| `/oss/:id` … | `GET /api/oss/:id` (and sibling routes on the OSS viewset). |
| `/models/:id` … | `GET /api/models/:id` (RSModel router). |

**Machine-readable OpenAPI:** `GET https://api.portal.acconcept.ru/schema` (Swagger UI root on the API host is separate; prefer `/schema` for JSON).

Locally, the **path prefix stays `/api/...`**; the API base URL comes from `VITE_PORTAL_BACKEND` (`rsconcept/frontend/src/utils/build-constants.ts`).

## Edit Rules

- Frontend code/routes/state/API hooks -> `rsconcept/frontend`.
- Backend API/models/serializers/permissions/settings -> `rsconcept/backend`.
- Frontend UI text: follow frontend i18n rules; keep `useTx`/`globalTx` ids and `en`/`ru`/`fr` slices synced.
- API contract changes: sync frontend/backend.
- Preserve code and work outside your current task scope.
- Function arg order changes: update all callsites.

## Agent skills

- Domain docs: `CONTEXT.md`.
- **Project skills (git):** `.agents/skills/<name>/` — shared Portal workflows (`i18n-extract`, `diagnose`, `triage`, etc.). Edit and commit here.
- **`rstool-helper` (two copies, keep identical):** `rsconcept/rstool/skills/rstool-helper/` and `.agents/skills/rstool-helper/`. When you change either, update the other in the same change set (see `rsconcept/rstool/AGENTS.md` checklist).
- **User-global skills:** `~/.cursor/skills-cursor/` — not in this repo.
- Index: `.agents/skills/README.md`; rstool notes: `rsconcept/rstool/skills/README.md`.
