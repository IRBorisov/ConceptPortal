# AGENTS.md — onboarding tours

How to add or expand guided tours. Engine code (`models/`, `stores/`, `components/`, `utils/`) is tour-agnostic — leave it alone unless fixing a shared bug.

## Layout

| Piece                  | Where                                                        |
| ---------------------- | ------------------------------------------------------------ |
| Tour definition + copy | `tours/<tour-name>/` (`index.ts` + `content.{en,ru,fr}.tsx`) |
| Lazy catalog           | `tours/index.ts`                                             |
| Spotlights             | `data-tour="<anchor>"` on host UI                            |
| Start from help badge  | `<BadgeHelp tourID={…} />`                                   |

`TourHost` is already mounted in the app shells. Do not remount it.

## Existing tours

- **Shared editor** (Sandbox + schema + model): `constituents-list`, `concept-editor`, `term-graph` — keep copy/anchors context-neutral
- **Sandbox overview** (`sandbox-intro`): only `autoStart` tour; nests the shared/editor/model tours
- **Library**: `library-intro` (BadgeHelp only)
- **Model tabs**: `model-value`, `model-evaluator`
- **OSS**: `oss-graph`
- **Passports**: `schema-passport`, `model-passport`, `oss-passport`, `sandbox-passport` — end on `passport-stats`; wire via BadgeHelp on the form heading
- **Dialogs** (BadgeHelp only; open the dialog first): `formula-tree` (`Q` / Cmd+S extract), `structure-planner` (Cmd+S), `cst-template`, `relocate-cst`, `create-synthesis`

Do not register test-only fixtures (e.g. `engine-fixture`) in the production catalog.

## Add a tour

1. **`tours/<name>/index.ts`** — export a `Tour`:
   - `id`: stable kebab-case (persisted; never rename after release)
   - `version`: start at `1`
   - `route`: path or paths (exact or prefix, e.g. `/rsforms` → `/rsforms/12`)
   - `autoStart`: only if it should invite on first visit
   - `steps`: ordered list
     - no `anchor` → centered modal (welcome/finish)
     - with `anchor` → spotlight `data-tour="<anchor>"` (`placement`: top/bottom/left/right)
     - optional `subtour`, `onEnter` (e.g. switch tab), `mode: 'interact'` + `completeAction`
2. **`content.en.tsx` / `content.ru.tsx` / `content.fr.tsx`** — `Record<stepId, { title, body }>`. Same step ids in all three. Long prose stays here, **not** in `tx.*`.
3. **Register** in `tours/index.ts` (`autoStart`, `route`, dynamic `import()`). Keep catalog flags in sync with the tour. Register any `subtour` targets too.
4. **Anchors** — add `data-tour` on stable UI (tabs, toolbars). Prefer shared names across Sandbox/schema/model. Avoid virtualized/conditional nodes. Missing anchors show Retry; Next/Finish still work.
5. **Entry** — `<BadgeHelp tourID={id} />`, or `ensureTourLoaded(id)` then `restartTour(id)`.

## Edit a tour

- Copy only → update all three `content.*.tsx`; keep step keys aligned.
- Add/remove/reorder steps or change UX → **bump `version`** (re-offers to completed users; skipped stays opted out). Prefer appending over reordering.
- New scope → new tour id; do not reuse an id.

## Practice steps (optional)

For click-to-advance practice: `mode: 'interact'`, optional `completeAction: '<stable-id>'`. Feature code emits `emitOnboardingAction(id)` (`models/actions.ts`). Keep published action ids stable (`constituents-list.search-used`, `term-graph.labels-toggled`).

## Checks

```bash
pnpm --filter frontend exec vitest run src/features/onboarding
```

Registry tests validate every registered tour, subtour links, and that passport tours end on `passport-stats`. E2E (`pnpm --filter frontend exec playwright test onboarding`) covers invitation → start, next/back, complete, skip, session dismiss, pause/resume, Explore → return, and pause mid-subtour.
