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

## Edit Rules

- Frontend code/routes/state/API hooks -> `rsconcept/frontend`.
- Backend API/models/serializers/permissions/settings -> `rsconcept/backend`.
- Frontend UI text: follow frontend i18n rules; keep `useTx`/`globalTx` ids and `en`/`ru`/`fr` slices synced.
- API contract changes: sync frontend/backend.
- Preserve code and work outside your current task scope.
- Function arg order changes: update all callsites.

## Agent skills

- Domain docs: `CONTEXT.md``.
