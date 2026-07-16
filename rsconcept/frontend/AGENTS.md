# AGENTS.md

Rules for agents in `rsconcept/frontend`.

## Scope

Applies to all frontend files.

## Stack

Vite, React 19 + Compiler, Tailwind CSS, TypeScript, React Router, TanStack Query/Forms, Zustand, Vitest, Playwright, ESLint, Stylelint.

## Structure

- `src/app`: bootstrap, layout, routes, providers
- `src/services`: reusable service layer consumable by `features` (search, PDF export, …). Shared mechanics stay domain-agnostic; a service may colocate feature-specific exporters beside that chrome (e.g. `services/pdf` + `services/pdf/rsform`) when the engine is heavy, worker-bound, or shared across features — do not put such stacks back under `features/*/utils` solely for “colocation”
- `src/features`: feature UI, hooks, dialogs, pages
- `src/components`: shared UI blocks/controls
- `src/backend`: API transport/query setup
- `src/stores`: shared Zustand stores
- `src/utils`: utilities
- `src/i18n`: locales, maps, `useTx`, `globalTx`
- `tests`: E2E/setup files
- `public`: Static assets

## Commands

Run from repo root (pnpm workspace) unless noted:

- Install: `pnpm install` (then `pnpm --filter @rsconcept/domain run build`)
- Dev server: `pnpm --filter frontend run dev` (assume already running; run `pnpm --filter @rsconcept/domain run dev` when editing domain)
- Build: `pnpm --filter @rsconcept/domain run build && pnpm --filter frontend run build`
- Unit test: `pnpm --filter frontend test`
- E2E tests: `pnpm --filter frontend run test:e2e`
- Lint: `pnpm --filter frontend run lint` (slow; prefer targeted checks)
- Lint fix: `pnpm --filter frontend run lintFix` (ESLint auto-fix, including import sort)
- Regenerate parsers: `pnpm --filter frontend run generate`

## Feature Paths

- App shell/routes: `src/app`
- Auth: `src/features/auth`
- AI/prompts: `src/features/ai`
- Library: `src/features/library`
- RSForm: `src/features/rsform`
- RSModel: `src/features/rsmodel`
- OSS: `src/features/oss`
- Users: `src/features/users`
- Help: `src/features/help`
- Sandbox: `src/features/sandbox`
- Onboarding tours: `src/features/onboarding` (see its `AGENTS.md` for adding/editing tours)

## Feature public API (`index.ts`)

Each feature may expose `src/features/{name}/index.ts` as its **public contract** for cross-feature imports.

**Export via `index.ts` (explicit named exports only — no `export *`):**

- Types and interfaces (`export type { … }`)
- Zod schemas paired with DTOs (`export { schema… }`)
- Shared constants and enums (`UserRole`, `HelpTopic`, …)

**Import via deep paths (not through `index.ts`):**

- Components, pages, dialogs
- Hooks (`useAuth`, `useRSForm`, …)
- Stores (`useRoleStore`, `useLibrarySearchStore`, …)
- `backend/api.ts`, mutation/query hooks, loaders

After adding, removing, or moving imports (especially cross-feature dependency changes), run `pnpm --filter frontend run lintFix` to auto-sort imports (`eslint-plugin-simple-import-sort`).

**Cross-feature imports:** use `@/features/{name}` barrels for types, Zod schemas, and shared constants. Use deep paths for hooks, stores, components, and runtime helpers. Intra-feature imports may stay deep.

## Internationalization

**What belongs in message maps (`src/i18n`, `tx.*`)** — short, reusable copy only:

- **UI**: labels, buttons, nav, errors, toasts, empty states, validation, tooltips, pagination, shared controls.
- **Domain entities** (at catalog granularity): schema/library field names, rslang/grammar labels, AI shell strings, and similar **concise** product vocabulary.

**What does not belong in message maps** — keep these **out of** `app/*.ts`, `domain/*.ts`, and merged maps:

- Long-form content: **help manuals / topic bodies**, walkthrough prose, large markdown-like blocks.
- **Sample or seed data**: demo bundles, fixtures, synthetic datasets, evaluation examples.
- Any blob that would **bloat** catalogs, churn unrelated keys in `locale-keys-parity`, or mix documentation with UI strings.

For those, use **per-locale copies** colocated with the feature (for example `*.en.tsx` / `*.ru.tsx` / `*.fr.tsx`, or `*.en.json` beside the feature), import or switch by `AppLocale` / `useIntl`, and **do not** add `tx.*` ids for that text. Example: sandbox starter data in `src/features/sandbox/models/starter-bundles/*.json`.

Catalog workflow (`useTx` / `globalTx`, `tx.*` ids, en/ru/fr parity, naming): `.agents/skills/i18n-extract/SKILL.md`.

## Edit rules

- Keep components small; colocate feature helpers in the feature unless a shared/heavy engine belongs in `src/services` (see Structure).
- Preserve `src/features` naming/folder patterns.
- Avoid `useMemo`/`useCallback`; React Compiler handles memoization.
- Prefer `useEffectEvent` over `useCallback` for handlers used inside `useEffect`.
- In `useEffect`/`setTimeout`, use named function expressions, not anonymous arrows.
- Reuse existing hooks, dialogs, components.
- Keep API types/hooks synced with backend contracts.
- Add/update tests for parser, evaluation, or critical UI behavior changes.
- Tailwind config/styles live in `src/styles`.
- Long mixed-purpose class strings: group by purpose (layout/color/animation) via `clsx`/`cn`; use `clsx` when no prop merge needed.
- Help manuals: when adding/renaming topics/pages in `src/features/help`, update `src/features/help/pages/manuals-page/topic-page.tsx` (topic content: see **Internationalization** above).
- Reusable components: keep positioning (`absolute`, `relative`, `top-*`, margins, etc.) out; pass via parent `className`.
