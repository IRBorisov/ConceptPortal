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
- **Project skills:** `.agents/skills/<name>/`
- **`rstool-helper`:** canonical guide in `rsconcept/rstool/skills/rstool-helper/` + `rsconcept/rstool/docs/`; workspace entry skill `.agents/skills/rstool-helper/SKILL.md`.
