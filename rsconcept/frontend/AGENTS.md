# AGENTS.md

Rules for agents in `rsconcept/frontend`.

## Scope

Applies to all frontend files.

## Stack

Vite, React 19 + Compiler, Tailwind CSS, TypeScript, React Router, TanStack Query/Forms, Zustand, Vitest, Playwright, ESLint, Stylelint.

## Structure

- `src/app`: bootstrap, layout, routes, providers
- `src/domain`: shared domain abstractions
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

## Internationalization

- No hardcoded locale text. Use stable ids; update `en`, `ru`, `fr` for each id touched.
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
- Help manuals: when adding/renaming topics/pages in `src/features/help`, update `src/features/help/pages/manuals-page/topic-page.tsx`.
- Reusable components: keep positioning (`absolute`, `relative`, `top-*`, margins, etc.) out; pass via parent `className`.
