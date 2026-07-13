# AGENTS.md — onboarding tours

Rules for agents editing `src/features/onboarding` (guided tour engine) and for adding tours anywhere in the app.

## Architecture (do not change casually)

- **Engine** (`models/`, `stores/`, `components/`, `utils/`) is tour-agnostic. Never put tour-specific logic, ids, or copy in the engine.
- **Tours** live in `tours/<tour-name>/` and are pure data: a `Tour` definition plus per-locale content files.
- **Lazy registry**: `tours/index.ts` keeps a sync catalog (id / route / autoStart / loader). Tour content is loaded with `ensureTourLoaded` when auto-start offers a tour, Guide/Explore starts one, or `TourHost` sees an active id that is not cached yet. `getTourByID` is sync and only returns already-loaded tours.
- `TourHost` is mounted once per app shell (`layout-main.tsx`, `layout-sandbox.tsx`). Do not mount it elsewhere.
- Persistence: zustand store `useOnboardingStore`, localStorage key `portal.onboarding`, per-tour `{ status: pending|skipped|done, seenVersion, resumeStep }`.
- Nested tours: a step may set `subtour: '<tour-id>'`. The card shows Explore; finishing/skipping/escaping the subtour returns to that parent step. Nested stack is session-only (not persisted).
- Shared editor tours (`constituents-list`, `concept-editor`, `term-graph`) are reused by Sandbox, schema, and model — keep ids/anchors/copy context-neutral. Sandbox-only overview stays in `sandbox-intro`. Library browser tour is `library-intro`. Model-only tours (`model-value`, `model-evaluator`) cover Data/Evaluation tabs on Sandbox and `/models`. OSS composition canvas tour is `oss-graph`.
- Passport tours are type-specific: `schema-passport`, `model-passport`, `oss-passport`, plus slim `sandbox-passport`. Each ends on the statistics side panel (`passport-stats`). Prefer `BadgeHelp tourID` on the passport form heading for contextual start.
- Contextual tour entry: pass `tourID` to `BadgeHelp` (`features/help/components/badge-help.tsx`). Clicking the icon or the tooltip link under Manuals calls `restartTour`. Do not add tab-tour items to feature menus.

## Add a new tour

1. Create `tours/<tour-name>/index.ts` exporting a `Tour`:
   - `id`: stable kebab-case string (persisted; never rename after release).
   - `version`: start at 1.
   - `route`: pathname or list of pathnames where the tour may run. An entry matches exactly or as a prefix when followed by `/` (e.g. `/rsforms` → `/rsforms/12`). Used for auto-start and pause on leave.
   - `autoStart`: `true` to offer on first visit to a matching route.
   - `steps`: ordered `TourStep[]`. A step **without** `anchor` renders as a centered modal (use for welcome/finish). A step **with** `anchor` spotlights the element marked `data-tour="<anchor>"` and shows a popover (`placement`: top/bottom/left/right, default bottom). Optional `subtour` links a nested tour. Use `onEnter` to switch tabs via the provided controller before the anchor is resolved (`controller.pathname` is available).
2. Create `content.en.tsx`, `content.ru.tsx`, `content.fr.tsx` next to it, each exporting `Record<stepId, TourStepContent>` (`{ title, body }`). Long prose stays here — **never** in `tx.*` message maps (frontend i18n rule). Every step id must exist in all three locales (`validateTour` + registry test enforce this).
3. Register the tour in `tours/index.ts` (`tourRegistrations` with `autoStart`, `route`, and a dynamic `import()` loader). Keep catalog `route` / `autoStart` in sync with the tour definition (`validateTourRegistrations`). If a parent step references `subtour`, that tour must also be registered (`validateSubtourLinks`).
4. Add `data-tour="<anchor>"` attributes to target elements in the host feature. Prefer shared names (`tab-list`, `list-search`, `concept-check`, …) when the UI is shared across Sandbox/schema/model. Anchors are inert; pick stable elements (tab labels, toolbar buttons), not virtualized/conditional nodes. A missing anchor is normal for conditional UI — the host skips that step silently and never blocks the tour.
5. Manual re-entry: call `ensureTourLoaded(id)` then `restartTour(id)`, or wire `BadgeHelp tourID={…}` (it loads then restarts). Sandbox overview remains available from the sandbox menu.

## Edit an existing tour

- Copy/content changes: edit the three `content.*.tsx` files together; keep step keys in sync.
- Adding/removing/reordering steps or significant UX changes: **bump `version`** so users who skipped/completed the old version are re-offered the tour. `resumeStep` from old sessions is clamped, but prefer appending steps over reordering.
- Never reuse a tour `id` for different content scope; add a new tour instead.

## Engine invariants (keep true)

- Escape dismisses and persists the resume point (status stays `pending`); inside a subtour, Escape returns to the parent step and marks the subtour session-dismissed.
- Skip/Done on a subtour mark that tour and return to the parent; on a root tour they clear the active tour.
- Leaving a matching `tour.route` pauses the tour (same resume persistence, no `sessionDismissed`) so returning to the route auto-resumes. Nested parents’ resume points are also saved.
- Auto-start fires only on a matching route, only after zustand persist has hydrated, and is suppressed for the session after Escape (`sessionDismissed`).
- Short UI strings (`tx.onboarding.*`) live in `src/i18n/app/shell.{en,ru,fr}.ts`; keep all three locales in parity.
- Spotlight/card use `z-tour` (`--z-index-tour` in `index.css`), above modals.

## Tests

- Unit: `stores/onboarding.test.ts`, `models/tour.test.ts`, `tours/registry.test.ts` (`pnpm --filter frontend exec vitest run src/features/onboarding`). Registry test validates every registered tour and subtour links — new tours are covered automatically.
- E2E: `tests/onboarding.spec.ts` (`pnpm --filter frontend exec playwright test onboarding`). Assertions use Russian copy.
