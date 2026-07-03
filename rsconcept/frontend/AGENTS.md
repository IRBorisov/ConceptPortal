# AGENTS.md

Rules for agents in `rsconcept/frontend`.

## Scope

Applies to all frontend files.

## Stack

Vite, React 19 + Compiler, Tailwind CSS, TypeScript, React Router, TanStack Query/Forms, Zustand, Vitest, Playwright, ESLint, Stylelint.

## Structure

- `src/app`: bootstrap, layout, routes, providers
- `src/services`: domain-neutral service layer (search, etc.) consumable by `domain` and `features`
- `src/features`: feature UI, hooks, dialogs, pages
- `src/components`: shared UI blocks/controls
- `src/backend`: API transport/query setup
- `src/stores`: shared Zustand stores
- `src/utils`: utilities
- `src/i18n`: locales, maps, `useTx`, `globalTx`
- `tests`: E2E/setup files
- `public`: Static assets

## Commands

Run from `rsconcept/frontend`:

- Install: `npm install`
- Dev server: `npm run dev` (assume already running)
- Build: `npm run build`
- Unit test: `npm test`
- E2E tests: `npm run test:e2e`
- Lint: `npm run lint` (slow; prefer targeted checks)
- Lint fix: `npm run lintFix` (ESLint auto-fix, including import sort)
- Regenerate parsers: `npm run generate`

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

After adding, removing, or moving imports (especially cross-feature dependency changes), run `npm run lintFix` from `rsconcept/frontend` to auto-sort imports (`eslint-plugin-simple-import-sort`).

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

---

- No hardcoded locale text in **UI** that should live in catalogs: use stable ids; update `en`, `ru`, `fr` for each id touched.
- React: `useTx` from `@/i18n`, then `tx('tx.*', values?)`.
- Non-React: `globalTx('tx.*', values?)` from `@/i18n`.
- Runtime maps: `src/i18n/map/message-map.{en,ru,fr}.ts`; merge only.
- Edit strings in `src/i18n/app/*.{en,ru,fr}.ts` or `src/i18n/domain/*.{en,ru,fr}.ts`.
- `app/`: global UI copy (actions, shell/nav, errors, auth shell, pagination, graph/flow controls, reusable UI chrome).
- `domain/`: domain copy (library/schema, language/grammar, structural language, AI prompt tooling, business concepts).
- Ids: dotted `tx.*`; choose namespace by meaning, not render component. Reuse roots: `tx.general.*`, `tx.shell.*`, `tx.lib.*`, `tx.lang.*`, `tx.rslang.*`, `tx.ai.*`.
- Keep ids semantic/reusable (`tx.general.save`); add context only when copy is context-specific.
- Suffixes: `.hint` tooltips/help, `.short` compact, `.plural` plural, `.validate.*` validation, `.success`/`.fail` outcomes, `.confirm` confirmations.
- Values: use ICU placeholders (`{count}`); keep placeholder names identical across locales.
- Workflow: choose `app/` or `domain/`; add same id at same relative place in all 3 locale files; keep order. New slice -> create all 3 locale files and spread into all 3 runtime maps. `locale-keys-parity.test.ts` enforces parity/usage.

## Edit rules

- Keep components small; colocate feature helpers.
- Preserve `src/features` naming/folder patterns.
- Avoid `useMemo`/`useCallback`; React Compiler handles memoization.
- Prefer `useEffectEvent` over `useCallback` for handlers used inside `useEffect`.
- In `useEffect`/`setTimeout`, use named function expressions, not anonymous arrows.
- Reuse existing hooks, dialogs, components.
- Keep API types/hooks synced with backend contracts.
- Add/update tests for parser, evaluation, or critical UI behavior changes.
- Tailwind config/styles live in `src/styles`.
- Long mixed-purpose class strings: group by purpose (layout/color/animation) via `clsx`/`cn`; use `clsx` when no prop merge needed.
- Help manuals: when adding/renaming topics/pages in `src/features/help`, update `src/features/help/pages/manuals-page/topic-page.tsx`. Topic **content** stays in per-locale topic modules (or other feature-local copies), not in `src/i18n` message maps.
- Reusable components: keep positioning (`absolute`, `relative`, `top-*`, margins, etc.) out; pass via parent `className`.
