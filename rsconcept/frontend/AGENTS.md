# AGENTS.md

Frontend guidance for AI coding agents working in `rsconcept/frontend`.

## Scope

This file applies to all code under the frontend application directory.

## Stack

- Vite
- React 19
- React Compiler
- Tailwind CSS
- TypeScript
- React Router
- TanStack Query
- TanStack Forms
- Zustand
- Vitest
- Playwright
- ESLint + Stylelint

## File structure overview

- `src/app`: Application bootstrapping, layout, routing, and global providers
- `src/domain`: Shared domain abstractions
- `src/features`: Feature-level UI, data hooks, dialogs, pages
- `src/components`: Reusable UI building blocks and shared controls
- `src/backend`: Shared client-side API transport and query setup
- `src/stores`: Shared Zustand stores
- `src/utils`: General utility helpers
- `tests`: End-to-end and setup files
- `public`: Static assets

## Common commands

Run from `rsconcept/frontend`:

- Install dependencies: `npm install`
- Start dev server (**assume already running**): `npm run dev`
- Build: `npm run build`
- Unit tests: `npm test`
- E2E tests: `npm run test:e2e`
- Lint (runs slowly—prefer checking specific files): `npm run lint`
- Regenerate parsers: `npm run generate`

## File hints

- Routing & app shell: `src/app`
- Auth flows: `src/features/auth`
- AI UI and prompts: `src/features/ai`
- Library flows: `src/features/library`
- RSForm flows: `src/features/rsform`
- RSModel flows: `src/features/rsmodel`
- OSS flows: `src/features/oss`
- User management: `src/features/users`
- Help content: `src/features/help`
- Offline sandbox mode: `src/features/sandbox`

## Edit rules

- Prefer editing within relevant feature folders before adding new shared abstractions.
- Keep components small and colocate feature-specific helpers when possible.
- Preserve established naming and folder structure under `src/features`.
- Avoid using useMemo and useCallback - we compile with React 19 Compiler.
- Update or add tests when behavior changes in parsing, evaluation, or critical UI.
- Reuse existing hooks, dialogs, and components when extending behavior.
- Keep API-facing types and hooks consistent with backend contract/types.
- If you change a grammar file, regenerate parsers using the provided script.
- Tailwind CSS customizations are under `src/styles`, including `tailwind.config.ts` and global styles.
- When composing >4 Tailwind/utility classes, group by purpose (layout, color, animation) using `clsx` or `cn` for readability.
- Use `clsx` for class composition when props are not involved.

## Frontend-specific rules to extend

Add new instructions here:

- In `useEffect` hooks and `setTimeout` calls, use named function expressions instead of anonymous arrow callbacks.
- Prefer `useEffectEvent` over `useCallback` for handlers used inside `useEffect`.
- When adding or renaming Help manuals topics/pages under `src/features/help`, always update the help repository index wiring in the same change: `src/features/help/pages/manuals-page/topic-page.tsx` (topic -> component mapping)
