# Adversarial review: onboarding tour guide system

- **Date:** 2026-07-16
- **Scope:** `rsconcept/frontend/src/features/onboarding` (engine + catalog) and host wiring (`BadgeHelp`, `data-tour`, `emitOnboardingAction`)
- **Against:** `src/features/onboarding/AGENTS.md`, frontend `AGENTS.md` i18n/layout rules

## Verdict

The architecture is sound: lazy catalog, tour-agnostic engine, locale content colocated outside `tx.*`, registry validation, and a single `TourHost` mount. Product coverage is broad (sandbox, editors, OSS, passports, dialogs).

The weak spots are **subtour pause/resume**, **dialog tours fighting modal lifecycle**, thin **E2E coverage of the advanced engine**, and one **hard AGENTS.md violation** (`oss-passport` does not end on `passport-stats`). Version discipline and fixture hygiene rely on human process that the tests do not enforce.

---

## Agentic / AGENTS.md compliance

| Rule                                            | Status           | Notes                                                                                                             |
| ----------------------------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------- |
| Engine left tour-agnostic                       | **Pass**         | Product ids live in `tours/` + `OnboardingActionID`; host/store stay generic                                      |
| Only `sandbox-intro` has `autoStart`            | **Pass**         | Catalog + definitions agree; registry asserts                                                                     |
| Content in `content.{en,ru,fr}` not `tx.*`      | **Pass**         | Long prose colocated; chrome only via `tx.onboarding.*`                                                           |
| Catalog flags sync with tour defs               | **Pass**         | `validateTourRegistrations` in `registry.test.ts`                                                                 |
| Stable kebab ids; never rename after release    | **Pass**         | Ids centralized in `editor-tours.ts`                                                                              |
| Dialog tours BadgeHelp-only (open dialog first) | **Pass**         | `autoStart: false`; `tourID` on modals                                                                            |
| Shared editor tours context-neutral             | **Mostly pass**  | Copy is shared; `concept-editor` `onEnter` special-cases sandbox (`SANDBOX_TOUR_CST_ID`) — documented, acceptable |
| Practice action ids stable + emitted            | **Pass**         | Constants + emit sites + registry asserts                                                                         |
| Passports end on `passport-stats`               | **Fail**         | `oss-passport` continues past stats                                                                               |
| Bump `version` on step/UX change                | **Process only** | No automated check; easy to miss                                                                                  |
| Prefer append over reorder                      | **Process only** | Unenforced                                                                                                        |
| Do not remount `TourHost`                       | **Pass**         | Mounted in main + sandbox shells only                                                                             |

### Concrete AGENTS violation

**`oss-passport` does not end on `passport-stats`.**  
AGENTS lists passports as ending on `passport-stats`. Schema/model/sandbox comply. OSS has a sixth step (`graph` → subtour `oss-graph`) after `stats`:

```50:61:rsconcept/frontend/src/features/onboarding/tours/oss-passport/index.ts
    {
      id: 'stats',
      anchor: 'passport-stats',
      ...
    },
    {
      id: 'graph',
      anchor: 'tab-graph',
      placement: 'bottom',
      subtour: OssTourID.GRAPH,
      onEnter: openGraph
    }
```

Either update AGENTS (OSS passport intentionally bridges into the graph tour) or move the graph handoff out of the passport tour. Registry tests do not assert this rule.

### Soft hygiene (not a hard AGENTS break)

- **`engine-fixture` is in the production catalog** (`tours/index.ts`). Comment says test-only; it is still loadable via `ensureTourLoaded`, ships in the registration map, and references orphan anchor `engine-fixture-target`. Prefer test-only registration or a build-time exclude.
- **AGENTS “Checks” understate risk:** unit registry + sandbox-intro E2E leave interact, subtours, and dialog tours unguarded in Playwright.

---

## High severity

### 1. Pause mid-subtour destroys nesting

`pauseActiveTour` persists parent/child `resumeStep` (good) but clears `tourStack` and sets `resumeOfferTourID` to the **innermost** tour only:

```222:241:rsconcept/frontend/src/features/onboarding/stores/onboarding.ts
        pauseActiveTour: () => {
          ...
          resumeOfferTourID: activeTourID
        },
```

`startTour` always resets `tourStack: []`. Resume therefore restarts the child as a **standalone** tour. Completing it does not return to the parent. Typical fallout on `/sandbox`:

1. User Explore’s into a nested editor tour from `sandbox-intro`.
2. Navigates away (or `pagehide`) → pause.
3. Resume invitation is for the **child**, not the intro.
4. Finishing/skipping the child leaves `sandbox-intro` `pending` → auto-start invitation reappears for the parent.

Unit tests document the persistence shape (`pauseActiveTour while nested…`) but not the user-visible “orphan parent re-offer” loop. Nested Explore is the main pedagogical path for sandbox; this is a first-class UX bug.

### 2. Dialog tours vs modal Escape / close

Dialog tours assume the dialog stays open. Modals portal to `document.body` (outside `#root` inert). Escape closes the modal (`modal-view`); top-level tour Escape is **not** wired (only when `tourStack.length > 0`). Result:

- Dialog gone, tour still active on the route.
- Anchors missing → Retry path; Next/Skip still work.
- Explain overlay (`pointer-events-auto` full-screen) + `#root` inert leave a dimmed, mostly stuck UI until Skip/Finish.

No E2E covers “close dialog mid-tour.” Dialog tours are the newest surface and the least defended.

### 3. Practice actions before unlock are dropped

Interact subscription runs only when `isInteractUnlocked` is true. Emits that happen while the region/anchor is still resolving (or before the cutout mounts) are ignored — no queue, no latch. Fast users or slow layout can miss the step completion and must Next manually. Registry proves wiring; runtime race is untested.

### 4. Conditional spotlight anchors

`concept-editor` step `structure` anchors `concept-structure`, which only mounts when `showStructureButton` / `canOpenStructure` is true. Empty selection, wrong type, or read-only contexts → permanent Retry until the user Nexts past. AGENTS warns to avoid conditional nodes; this step violates that guidance in product.

---

## Medium severity

| Issue                                               | Why it matters                                                                                                                                                 |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **E2E covers only `sandbox-intro` chrome**          | AGENTS admits this; interact, Explore/subtour, Escape nest, missing-anchor Retry, BadgeHelp restart, dialog tours, version re-offer are untested in Playwright |
| **Version bump is honor system**                    | Completed users never see step/UX changes unless authors bump `version`; skipped users never re-see anything. Easy authoring footgun                           |
| **`aria-modal=true` but Escape often does nothing** | Top-level card claims modal semantics; Escape only dismisses nested tours. Screen-reader / muscle-memory expect dismiss                                        |
| **`z-topmost` tie with dialogs/tooltips**           | Tour and dialogs share the same z-token; stacking is DOM-order roulette when both portal to `body`                                                             |
| **Skipped is forever**                              | Documented and intentional, but harsh: one misclick on Skip permanently opts out across version bumps; only BadgeHelp/menu `restartTour` recovers              |
| **Fixture tour in prod catalog**                    | Orphan anchors, extra load surface, noise in `loadAllTours` / validation                                                                                       |
| **No semantic i18n parity**                         | `validateTour` checks step keys exist in en/ru/fr, not meaning, HelpLink targets, or unused keys                                                               |
| **Parent pending after orphan resume**              | Coupled to high-severity #1; can surprise users with a second invitation                                                                                       |

---

## What works well

- Lazy `tourRegistrations` + `ensureTourLoaded` keep prose/JSX out of the main bundle.
- Persist key `portal.onboarding` partializes only `tours`; session dismiss / active tour stay ephemeral.
- `shouldOfferTour`: skipped stays out; done re-offers after version bump — clear product policy.
- Registry tests: load all tours, `validateTour`, subtour links, catalog sync, practice `completeAction` wiring, single autoStart.
- Missing anchors degrade gracefully (Retry + Next), not hard-fail.
- Invitation is soft (no inert); active explain hard-inerts `#root` — good separation.
- i18n split matches frontend AGENTS (long walkthrough prose out of message maps).
- Shared `data-tour` names across sandbox / schema / model reduce duplication.

---

## Recommended fix order

1. **Fix or document `oss-passport` ending** — align code with AGENTS or update AGENTS + add a registry assertion for passport last-anchor.
2. **Pause/resume with stack** — persist `tourStack` (or resume the outermost tour and re-enter to the saved child). Avoid orphaning parents.
3. **Dialog tour lifecycle** — on modal unmount, pause/dismiss the active dialog tour; or bind Escape to Skip/dismiss when the tour owns a modal.
4. **Latch practice actions** — remember the last matching `completeAction` for the current step even before unlock.
5. **E2E for advanced paths** — at least: Explore → complete return; pause mid-subtour; one interact `completeAction`; one dialog tour open/close.
6. **Drop or gate `engine-fixture`** from the production registration map.
7. **Optional lint** — fail CI if passport tours’ last step anchor ≠ `passport-stats` (once policy is clear); warn when step count/ids change without `version` bump (heuristic).

---

## Key files

| Path                                                  | Role                                                    |
| ----------------------------------------------------- | ------------------------------------------------------- |
| `src/features/onboarding/AGENTS.md`                   | Authoring contract                                      |
| `src/features/onboarding/stores/onboarding.ts`        | Progress, stack, pause/resume, offer policy             |
| `src/features/onboarding/components/tour-host.tsx`    | Invitation, overlays, inert, interact subscribe, Escape |
| `src/features/onboarding/tours/index.ts`              | Lazy catalog + validation helpers                       |
| `src/features/onboarding/tours/oss-passport/index.ts` | AGENTS passport-ending violation                        |
| `src/features/onboarding/tours/registry.test.ts`      | Structural guarantees (not product UX)                  |
| `tests/onboarding.spec.ts`                            | Engine smoke E2E (sandbox-intro only)                   |
| `src/features/help/components/badge-help.tsx`         | Manual restart entry                                    |

---

## Bottom line

**Mostly compliant** with onboarding AGENTS and frontend i18n rules, with one clear documentation/code mismatch (`oss-passport`) and several process gaps (version bumps, fixture catalog).

**Not production-hardened** for the flows the product markets hardest: nested Explore from sandbox, dialog help tours, and click-to-advance practice. Fix pause/stack and dialog teardown before adding more tours on those paths.
