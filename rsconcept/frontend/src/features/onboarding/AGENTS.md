# AGENTS.md — onboarding tours

Rules for agents editing `src/features/onboarding` (guided tour engine) and for adding tours anywhere in the app.

## Architecture (do not change casually)

- **Engine** (`models/`, `stores/`, `components/`, `utils/`) is tour-agnostic. Never put tour-specific logic, ids, or copy in the engine.
- **Tours** live in `tours/<tour-name>/` and are pure data: a `Tour` definition plus per-locale content files.
- `TourHost` is mounted once per app shell (`layout-main.tsx`, `layout-sandbox.tsx`). Do not mount it elsewhere.
- Persistence: zustand store `useOnboardingStore`, localStorage key `portal.onboarding`, per-tour `{ status: pending|skipped|done, seenVersion, resumeStep }`.

## Add a new tour

1. Create `tours/<tour-name>/index.ts` exporting a `Tour`:
   - `id`: stable kebab-case string (persisted; never rename after release).
   - `version`: start at 1.
   - `route`: exact pathname where the tour runs (also used for auto-start and auto-dismiss on leave).
   - `autoStart`: `true` to offer on first visit to `route`.
   - `steps`: ordered `TourStep[]`. A step **without** `anchor` renders as a centered modal (use for welcome/finish). A step **with** `anchor` spotlights the element marked `data-tour="<anchor>"` and shows a popover (`placement`: top/bottom/left/right, default bottom). Use `onEnter` to switch tabs via the provided controller before the anchor is resolved.
2. Create `content.en.tsx`, `content.ru.tsx`, `content.fr.tsx` next to it, each exporting `Record<stepId, TourStepContent>` (`{ title, body }`). Long prose stays here — **never** in `tx.*` message maps (frontend i18n rule). Every step id must exist in all three locales (`validateTour` + registry test enforce this).
3. Register the tour in `tours/index.ts` (`allTours`). Nothing else in the engine changes.
4. Add `data-tour="<anchor>"` attributes to target elements in the host feature. Anchors are inert; pick stable elements (tab labels, toolbar buttons), not virtualized/conditional nodes. A missing anchor skips the step with a console warning — it never blocks.
5. If the tour needs a manual re-entry point, call `useOnboardingStore(s => s.restartTour)` with the tour id (see `sandbox/pages/sandbox-editor/menu-main.tsx`).

## Edit an existing tour

- Copy/content changes: edit the three `content.*.tsx` files together; keep step keys in sync.
- Adding/removing/reordering steps or significant UX changes: **bump `version`** so users who skipped/completed the old version are re-offered the tour. `resumeStep` from old sessions is clamped, but prefer appending steps over reordering.
- Never reuse a tour `id` for different content scope; add a new tour instead.

## Engine invariants (keep true)

- Escape dismisses and persists the resume point (status stays `pending`); Skip/Done persist `seenVersion`.
- Leaving `tour.route` pauses the tour (same resume persistence, no `sessionDismissed`) so returning to the route auto-resumes.
- Auto-start fires only on `tour.route` and is suppressed for the session after Escape (`sessionDismissed`).
- Short UI strings (`tx.onboarding.*`) live in `src/i18n/app/shell.{en,ru,fr}.ts`; keep all three locales in parity.
- Spotlight/card use `z-tour` (`--z-index-tour` in `index.css`), above modals.

## Tests

- Unit: `stores/onboarding.test.ts`, `models/tour.test.ts`, `tours/registry.test.ts` (`pnpm --filter frontend exec vitest run src/features/onboarding`). Registry test validates every registered tour — new tours are covered automatically.
- E2E: `tests/onboarding.spec.ts` (`pnpm --filter frontend exec playwright test onboarding`). Assertions use Russian copy; dropdown buttons are located by their `title` hint, not inner text.
