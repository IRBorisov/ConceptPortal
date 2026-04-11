# AGENTS.md

**Workspace Guidance for AI Coding Agents**

---

## Scope

- This file governs the entire repository unless a subdirectory contains its own `AGENTS.md`.
- For specific guidance, see:
  - `rsconcept/frontend/AGENTS.md` (Vite + React app)
  - `rsconcept/backend/AGENTS.md` (Django backend)

---

## Repository Structure

- `README.md` — Setup, conventions, and run instructions.
- `rsconcept/frontend` — Frontend app (Vite, React, TypeScript).
- `rsconcept/backend` — Backend app (Django).
- `scripts/dev` — Local development scripts (linting, testing, startup).
- `scripts/prod` — Production deployment scripts.
- `nginx` — Reverse proxy and deployment configs.
- `docker-compose-*.yml` — Container definitions.

---

## Navigation Guidance

- Edit **frontend** code, routes, state, or API hooks in: `rsconcept/frontend`.
- Edit **backend** (API, models, serializers, permissions, Django settings) in: `rsconcept/backend`.
- Always read the most specific (nearest) `AGENTS.md` before making changes.

---

## Edit Rules

- Keep frontend and backend changes in sync if API contracts change.
- Prefer focused, localized changes; avoid broad refactors unless directed.
- Preserve code and work outside your current task scope.
- When changing arguments of function consider their order. After changing the order check for function calls and update them.

---

## Extensible Project Rules

_Add team or project-specific guidance below as needed for AI agents._

---
