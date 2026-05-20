# AGENTS.md

Workspace rules for agents.

## Scope

- Applies repo-wide unless nearer `AGENTS.md` exists.
- Read nearest rules before editing: `rsconcept/frontend/AGENTS.md`, `rsconcept/backend/AGENTS.md`, `rsconcept/rstool/AGENTS.md`.

## Structure

- `README.md`: setup/conventions/run docs
- `rsconcept/frontend`: Vite React TS app
- `rsconcept/backend`: Django backend
- `scripts/dev`: local lint/test/start scripts
- `scripts/prod`: deploy scripts
- `nginx`: reverse proxy/deploy config
- `docker-compose-*.yml`: containers

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
