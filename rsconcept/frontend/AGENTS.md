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

## Internationalization (user-visible UI copy)

- **Do not** introduce or leave user-facing copy as hardcoded Russian (or any single locale) in `.tsx` / `.ts` UI code. Use the compact hook: `useTx` from `@/i18n` with an **English** `defaultMessage` in the call site, for example: `tx('ui.some.key', 'Human readable English', optionalValues)`.
- **When you add, change, or remove** any such string (labels, buttons, placeholders, `title` / `aria-label`, dialog headers, empty states, etc.):
  1. Use a stable message **id** (prefer the existing `ui.*` namespace for shared chrome, e.g. `ui.action.save`, `ui.nav.library`, or add a new dotted key under `ui.` when it is reusable).
  2. **Update every locale catalog** that the app ships for those ids. Today that means editing **both**:
     - `src/app/i18n/messages/partials/ui.ru.ts`
     - `src/app/i18n/messages/partials/ui.fr.ts`
       with the **same keys** and appropriate Russian and French values (keep keys alphabetically or grouped consistently with neighboring keys).
  3. If the English default meaning changes, update `defaultMessage` in code **and** adjust `ui.ru.ts` / `ui.fr.ts` so all three stay aligned.
- Message bundles are merged in `src/app/i18n/messages/ru.ts` and `fr.ts` from `partials/`; new partial files must be imported there—**`ui.ru` / `ui.fr` are already wired**; prefer adding keys there unless you are intentionally starting a new partial.
- **Domain / feature wording** that already goes through `formatLabel` / `labels-*` and backend-driven catalogs: follow the same rule—**any new or changed `lid` / label id** must have matching entries in the relevant label partials for each supported locale (see `src/utils/labels` and `src/**/labels-feature-ui.*`).

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
- When composing >4 Tailwind/utility classes of different semantic meaning, group them by purpose (layout, color, animation) using `clsx` or `cn`. Use `clsx` for class composition when props are not involved.
- In `useEffect` hooks and `setTimeout` calls, use named function expressions instead of anonymous arrow callbacks.
- Prefer `useEffectEvent` over `useCallback` for handlers used inside `useEffect`.
- When adding or renaming Help manuals topics/pages under `src/features/help`, always update the help repository index wiring in the same change: `src/features/help/pages/manuals-page/topic-page.tsx` (topic -> component mapping)
- In extracted/reusable components, keep positioning/layout classes (for example `absolute`, `relative`, `top-*`, `left-*`, `right-*`, `bottom-*`, margins) out of the component itself. Pass these via `className` from the parent context where the component is placed.
