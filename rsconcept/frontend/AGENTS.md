# AGENTS.md

Frontend guidance for AI coding agents working in `rsconcept/frontend`.

## Scope

This file applies to the frontend app in this directory tree.

## Stack

- Vite
- React 19
- React Compiler
- TypeScript
- React Router
- TanStack Query
- Zustand
- Vitest
- Playwright
- ESLint + Stylelint

## Frontend map

- `src/app` contains app bootstrapping, layout, routing, and global providers.
- `src/features` contains feature-level UI, data hooks, dialogs, pages, and domain logic.
- `src/components` contains reusable UI building blocks and shared controls.
- `src/backend` contains shared client-side API transport and query setup.
- `src/stores` contains shared Zustand stores.
- `src/utils` contains general utility helpers.
- `tests` contains end-to-end and setup files.
- `public` contains static assets.

## Working style

- Prefer making changes inside the relevant feature folder before adding new shared abstractions.
- Reuse existing hooks, dialogs, and component patterns when extending behavior.
- Keep API-facing types and hooks consistent with backend responses.
- If you change a grammar file, regenerate parsers with the existing script.

## Common commands

Run from `rsconcept/frontend`:

- Install deps: `npm install`
- Start dev server - ASSUME ALREADY RUNNING: `npm run dev`
- Build: `npm run build`
- Unit tests: `npm test`
- E2E tests: `npm run test:e2e`
- Lint: `npm run lint`
- Regenerate parsers: `npm run generate`

## File hints

- Routing and app shell: `src/app`
- Auth flows: `src/features/auth`
- AI UI and prompt templates: `src/features/ai`
- Library flows: `src/features/library`
- RSForm flows: `src/features/rsform`
- RSModel flows: `src/features/rsmodel`
- OSS flows: `src/features/oss`
- User management: `src/features/users`
- Help content: `src/features/help`

## Edit rules

- Keep components small and colocate feature-specific helpers when possible.
- Preserve established naming and folder structure in `src/features`.
- Update tests when behavior changes in parsing, evaluation, or critical UI workflows.
- For API changes, verify the matching backend endpoint and types.

## Frontend-specific rules to extend

Add new instructions here:

- In useEffect hooks, always use named function expressions instead of anonymous arrow callbacks.
- Prefer useEffectEvent over useCallback for handlers used inside useEffect.
