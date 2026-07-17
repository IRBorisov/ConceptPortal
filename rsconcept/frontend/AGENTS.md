# AGENTS.md

Rules for agents in `rsconcept/frontend`.

## Scope

Applies to all frontend files.

## Stack

Vite, React 19 + Compiler, Tailwind CSS, TypeScript, React Router, TanStack Query/Forms, Zustand, Vitest, Playwright, ESLint, Stylelint.

## Structure

- `src/app` — bootstrap, layout, routes, providers
- `src/services` — reusable services for features (search, PDF, …); heavy/worker exporters may live under `services/<name>/<feature>` (e.g. `services/pdf/rsform`)
- `src/features` — feature UI, hooks, dialogs, pages (onboarding tours: `src/features/onboarding/AGENTS.md`)
- `src/components` — shared UI
- `src/backend` — API transport/query setup
- `src/stores` — shared Zustand stores
- `src/utils`, `src/i18n`, `tests`, `public` — utilities, locales, E2E, static assets

## Commands

From repo root (pnpm workspace) unless noted:

- Install: `pnpm install` (then `pnpm --filter @rsconcept/domain run build`)
- Dev: `pnpm --filter frontend run dev` (rebuild/watch domain when editing it)
- Build: `pnpm --filter @rsconcept/domain run build && pnpm --filter frontend run build`
- Unit / E2E: `pnpm --filter frontend test` / `pnpm --filter frontend run test:e2e`
- Lint: `pnpm --filter frontend run lint` (slow; prefer targeted checks)
- Lint fix + import sort: `pnpm --filter frontend run lintFix`
- Parsers: `pnpm --filter frontend run generate`

## Feature public API (`index.ts`)

| Through `index.ts` (named exports only — no `export *`) | Deep import (not via barrel)                                      |
| ------------------------------------------------------- | ----------------------------------------------------------------- |
| Types, Zod schemas next to DTOs, shared constants/enums | Components, pages, dialogs, hooks, stores, `backend/api`, loaders |

Cross-feature: barrels for types/schemas/constants; deep paths for hooks/stores/components/runtime helpers. Intra-feature may stay deep. After import moves, run `lintFix`.

## Internationalization

- Short UI/domain vocabulary → `tx.*` via `useTx` / `globalTx` (`src/i18n`, en/ru/fr parity).
- Long help/manuals, walkthroughs, sample/seed data → feature-local locale files — not message maps.
- Catalog workflow and naming: `.agents/skills/i18n-extract/SKILL.md`.

## Edit rules

- Keep components small; colocate feature helpers unless a shared/heavy engine belongs in `src/services`.
- Avoid `useMemo`/`useCallback` (React Compiler); prefer `useEffectEvent` for handlers used in `useEffect`.
- In `useEffect`/`setTimeout`, use named function expressions.
- Reuse existing hooks, dialogs, components; keep API types synced with backend.
- Add/update tests for parser, evaluation, or critical UI behavior changes.
- Tailwind in `src/styles`; long class strings: group via `clsx`/`cn`.
- Help manuals: topic registry in `src/features/help/pages/manuals-page/topic-page.tsx`.
- Reusable components: no positioning utilities; pass via parent `className`.
