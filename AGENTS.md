# AGENTS.md

Repository guidance for AI coding agents working in this workspace.

## Scope

This file applies to the whole repository unless a deeper `AGENTS.md` overrides part of it.
More specific guidance exists in:

- `rsconcept/frontend/AGENTS.md`
- `rsconcept/backend/AGENTS.md`

## Repository map

- `README.md` contains setup notes, conventions, and local run instructions.
- `rsconcept/frontend` contains the Vite + React + TypeScript app.
- `rsconcept/backend` contains the Django backend.
- `scripts/dev` contains common local development helpers for linting, tests, and startup.
- `scripts/prod` contains production-oriented scripts.
- `nginx` contains reverse proxy and deployment configs.
- `docker-compose-*.yml` define local and production container setups.

## How to navigate

- Start at `README.md` for environment and workflow context.
- When changing UI, routes, client state, or API hooks, move into `rsconcept/frontend`.
- When changing API behavior, models, serializers, permissions, or Django settings, move into `rsconcept/backend`.
- Prefer reading the nearest scoped `AGENTS.md` before editing files in a subproject.

## Common commands

From repository root:

- Run all tests: `powershell -File scripts/dev/RunTests.ps1`
- Run all linters: `powershell -File scripts/dev/RunLint.ps1`
- Start local servers - NOT FOR AGENTS: `powershell -File scripts/dev/RunServer.ps1`
- Run local setup - NOT FOR AGENTS: `powershell -File scripts/dev/LocalDevSetup.ps1`

## Edit rules

- Keep frontend and backend changes aligned when API contracts change.
- Prefer minimal, localized changes over broad refactors unless the task explicitly asks for restructuring.
- Reuse existing scripts in `scripts/dev` before inventing one-off commands.
- Preserve user changes outside the current task.

## Project-specific rules to extend

Add new instructions here.

## Notes for future edits

- If you add new top-level apps or services, update this file so agents can discover them quickly.
- If workflow expectations differ by area, prefer putting that detail in the nearest subdirectory `AGENTS.md`.
