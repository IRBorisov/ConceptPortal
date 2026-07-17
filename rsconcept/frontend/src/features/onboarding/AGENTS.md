# AGENTS.md — onboarding tours

Engine (`models/`, `stores/`, `components/`, `utils/`) is tour-agnostic — leave it alone unless fixing a shared bug.

## Layout

| Piece                  | Where                                                        |
| ---------------------- | ------------------------------------------------------------ |
| Tour definition + copy | `tours/<tour-name>/` (`index.ts` + `content.{en,ru,fr}.tsx`) |
| Lazy catalog           | `tours/index.ts`                                             |
| Spotlights             | `data-tour="<anchor>"` on host UI                            |
| Start from help badge  | `<BadgeHelp tourID={…} />`                                   |

`TourHost` is already mounted in app shells — do not remount it.

## Invariants

- Shared editor tours (Sandbox + schema + model): keep copy/anchors context-neutral.
- Only `sandbox-intro` uses `autoStart`.
- `id` is persisted — never rename after release; bump `version` on structural/UX step changes (re-offers to completed users; skipped stays opted out).
- Long copy lives in `content.*.tsx`, not `tx.*`.
- Do not register test-only fixtures in the production catalog.
- Passport tours must end on `passport-stats` (enforced by registry tests).

## Add or edit a tour

Copy an existing tour folder; register in `tours/index.ts`; keep catalog flags in sync. Registry tests must pass.

- Copy-only edits → all three `content.*.tsx` with aligned step keys.
- New scope → new tour id; do not reuse an id.
- Practice steps: `mode: 'interact'` + optional `completeAction`; emit via `emitOnboardingAction` (`models/actions.ts`); keep published action ids stable.

## Checks

```bash
pnpm --filter frontend exec vitest run src/features/onboarding
```
