# AGENTS.md — onboarding tours

Rules for agents editing `src/features/onboarding` (guided tour engine) and for adding tours anywhere in the app.

## Architecture (do not change casually)

- **Engine** (`models/`, `stores/`, `components/`, `utils/`) is tour-agnostic. Never put tour-specific logic, ids, or copy in the engine.
- **Tours** live in `tours/<tour-name>/` and are pure data: a `Tour` definition plus per-locale content files.
- **Lazy registry**: `tours/index.ts` keeps a sync catalog (id / route / autoStart / loader). Tour content is loaded with `ensureTourLoaded` when auto-start offers a tour, Guide/Explore starts one, or `TourHost` sees an active id that is not cached yet. `getTourByID` is sync and only returns already-loaded tours.
- `TourHost` is mounted once per app shell (`layout-main.tsx`, `layout-sandbox.tsx`). Do not mount it elsewhere.
- Persistence: zustand store `useOnboardingStore`, localStorage key `portal.onboarding`, per-tour `{ status: pending|skipped|done, seenVersion, resumeStep }`.
- Nested tours: a step may set `subtour: '<tour-id>'`. The card shows Explore; finishing/skipping/escaping the subtour returns to that parent step. Nested stack is session-only (not persisted).
- Shared editor tours (`constituents-list`, `concept-editor`, `term-graph`) are reused by Sandbox, schema, and model — keep ids/anchors/copy context-neutral. Sandbox-only overview stays in `sandbox-intro` and is the only `autoStart` tour. Library browser tour is `library-intro` (manual via BadgeHelp only). Model-only tours (`model-value`, `model-evaluator`) cover Data/Evaluation tabs on Sandbox and `/models`. OSS composition canvas tour is `oss-graph`.
- Passport tours are type-specific: `schema-passport`, `model-passport`, `oss-passport`, plus slim `sandbox-passport`. Each ends on the statistics side panel (`passport-stats`). Prefer `BadgeHelp tourID` on the passport form heading for contextual start.
- Contextual tour entry: pass `tourID` to `BadgeHelp` (`features/help/components/badge-help.tsx`). With a tour the badge shows `IconTour` and click opens Quick guide / Read manual; without a tour it shows `IconHelp` and opens the manuals page. Hover still shows the manual preview when inline help is on (suppressed while the menu is open). Tour-enabled badges remain available when inline help is hidden. Do not add tab-tour items to feature menus.

## Lifecycle events (privacy-safe)

- Public browser event name: **`portal:onboarding`** (`ONBOARDING_EVENT_NAME` in `models/events.ts`).
- Emit via `emitOnboardingEvent` / subscribe via `subscribeOnboardingEvents`. Framework-neutral CustomEvent; no analytics SDK, Sentry, or network transport.
- Payload (`OnboardingEventDetail`) is product metadata only: `name`, `tourId`, `tourVersion`, optional `stepId` / `stepIndex` / `stepCount`, `route` (pathname only), `locale`, optional `layout` (`anchored` | `centered` | `bottom-sheet`), optional `source` (`invitation` | `manual` | `menu`), `timestamp`.
- Never put content text, user IDs, item IDs, query strings, or error messages in the detail.
- Instrumented transitions: `invitation_shown` / `invitation_accepted` / `invitation_not_now`; `tour_started` / `tour_restarted`; `step_viewed` (once per tour+step until identity changes); `subtour_entered`; `anchor_unavailable` / `anchor_retried`; `action_completed` (includes matched `actionId`); `skipped`; `completed`; `load_failed`.
- Entry `source`: invitation accept → `invitation`; BadgeHelp Quick guide → `manual`; sandbox menu Guide → `menu`.

## Add a new tour

1. Create `tours/<tour-name>/index.ts` exporting a `Tour`:
   - `id`: stable kebab-case string (persisted; never rename after release).
   - `version`: start at 1.
   - `route`: pathname or list of pathnames where the tour may run. An entry matches exactly or as a prefix when followed by `/` (e.g. `/rsforms` → `/rsforms/12`). Used for auto-start and pause on leave.
   - `autoStart`: `true` to offer on first visit to a matching route.
   - `steps`: ordered `TourStep[]`. A step **without** `anchor` renders as a centered modal (use for welcome/finish). A step **with** `anchor` spotlights the element marked `data-tour="<anchor>"` and shows a popover (`placement`: top/bottom/left/right, default bottom). Optional `mode`: `explain` (default) or `interact`. Explain steps keep the app inert (`#root`) with a full blocking overlay. Interact steps unlock a declared **interaction region** (`interactionRegion`, defaulting to `anchor`) via a four-panel cutout overlay; pointer events outside the region are blocked. Optional `completeAction` (stable string id) pairs with `emitOnboardingAction` / `subscribeOnboardingActions` (`models/actions.ts`) so the host auto-advances once when the action fires; **Next** stays visible as a manual fallback. Optional `subtour` links a nested tour. Use `onEnter` to switch tabs via the provided controller before the anchor is resolved (`controller.pathname` is available). `validateTour` rejects invalid mode/region/action combinations.
2. Create `content.en.tsx`, `content.ru.tsx`, `content.fr.tsx` next to it, each exporting `Record<stepId, TourStepContent>` (`{ title, body }`). Long prose stays here — **never** in `tx.*` message maps (frontend i18n rule). Every step id must exist in all three locales (`validateTour` + registry test enforce this).
3. Register the tour in `tours/index.ts` (`tourRegistrations` with `autoStart`, `route`, and a dynamic `import()` loader). Keep catalog `route` / `autoStart` in sync with the tour definition (`validateTourRegistrations`). If a parent step references `subtour`, that tour must also be registered (`validateSubtourLinks`).
4. Add `data-tour="<anchor>"` attributes to target elements in the host feature. Prefer shared names (`tab-list`, `list-search`, `concept-check`, …) when the UI is shared across Sandbox/schema/model. Anchors are inert; pick stable elements (tab labels, toolbar buttons), not virtualized/conditional nodes. When a step anchor is missing or hidden, the host shows a warning plus Retry; **Next** / **Finish** remain for manual advance (no auto-skip, including on the last step).
5. Manual re-entry: call `ensureTourLoaded(id)` then `restartTour(id)`, or wire `BadgeHelp tourID={…}` (it loads then restarts). Sandbox overview remains available from the sandbox menu.

## Edit an existing tour

- Copy/content changes: edit the three `content.*.tsx` files together; keep step keys in sync.
- Adding/removing/reordering steps or significant UX changes: **bump `version`** so users who completed the old version are re-offered the tour. Explicitly **skipped** tours stay opted out of automatic offers across bumps; manual BadgeHelp/menu restart still works. `resumeStep` from old sessions is clamped, but prefer appending steps over reordering.
- Never reuse a tour `id` for different content scope; add a new tour instead.

## Practice actions (Wave 3)

- Public browser event: **`portal:onboarding-action`** (`ONBOARDING_ACTION_EVENT_NAME` in `models/actions.ts`).
- Features emit with `emitOnboardingAction('<stable-id>')`; subscribe with `subscribeOnboardingActions`. SSR-safe; no domain coupling.
- Tour steps set `mode: 'interact'` and optional `completeAction: '<same-id>'`. TourHost ignores actions while another tour/step is active, while the region is unavailable, or after one auto-advance for that step.
- Published pilot ids are `constituents-list.search-used` and `term-graph.labels-toggled` (`OnboardingActionID`); keep them stable.

## Engine invariants (keep true)

- **Skip tour** permanently opts out (`status: skipped`); do not use it for temporary dismissal. Skipped tours are never auto-offered again, even after version bumps.
- Skip/Done on a subtour mark that tour and return to the parent; on a root tour they clear the active tour.
- Leaving a matching `tour.route` pauses the tour (same resume persistence, no `sessionDismissed`) so returning to the route shows the invitation again (Resume when `resumeStep > 0`). Nested parents’ resume points are also saved.
- Interact steps do **not** mark `#root` inert; keyboard focus is contained to the tour card plus the resolved interaction region. Explain steps keep full-app inert behavior.
- Start/Resume activates at the saved `resumeStep` (Resume wording when `resumeStep > 0`). Route change or an ineligible candidate dismisses a stale invitation; only one invitation is shown.
- Short UI strings (`tx.onboarding.*`) live in `src/i18n/app/shell.{en,ru,fr}.ts`; keep all three locales in parity.
- Spotlight/card use `z-tour` (`--z-index-tour` in `index.css`), above modals.

## Tests

- Unit: `stores/onboarding.test.ts`, `models/tour.test.ts`, `models/events.test.ts`, `models/actions.test.ts`, `utils/interact-cutout.test.ts`, `utils/focus-containment.test.ts`, `tours/registry.test.ts` (`pnpm --filter frontend exec vitest run src/features/onboarding`). Registry test validates every registered tour and subtour links — new tours are covered automatically. Internal `engine-fixture` tour supports interact E2E only.
- E2E: `tests/onboarding.spec.ts` (`pnpm --filter frontend exec playwright test onboarding`). Assertions use Russian copy. BadgeHelp tour entry is covered there (`source: 'manual'`).
