# Coding style

Conventions for writing code that feels consistent. Focused on naming, module boundaries, UI composition, copy, and tests — not on specific lint configs or tool flags.

## General posture

- Prefer **clarity and colocation** over premature abstraction.
- Reuse existing hooks, dialogs, and components before inventing parallel ones.
- Keep units small: a page, dialog, or hook should do one job.
- Change the API contract and its clients together.
- When behavior matters, update or add tests with the change.

## Naming

| Kind                | Convention                                                               |
| ------------------- | ------------------------------------------------------------------------ |
| Files and folders   | `kebab-case`                                                             |
| React components    | `PascalCase`, name matches purpose                                       |
| Hooks               | `use*` / files often `use-*.ts`                                          |
| Stores              | `use*Store`; store module named for the concern                          |
| Feature API modules | `api.ts` exporting a feature API object and query keys                   |
| Wire types          | `*DTO`; schemas named for the payload they describe                      |
| Dialog modules      | `dlg-*` files; store methods like `showX` / `hideDialog`                 |
| Backend tests       | Group by concern (models vs views); one focused test module per behavior |

Names should describe **role**, not implementation detail.

## Module boundaries

### Feature public API

Feature barrels export **types, schemas, and shared constants** only — named exports, no star-re-exports.

Do **not** barrel-export components, pages, dialogs, hooks, stores, or API runtime modules. Cross-feature consumers deep-import those when needed. Inside a feature, deep imports are fine.

### Shared vs local

| Prefer shared when…                        | Keep local when…                                  |
| ------------------------------------------ | ------------------------------------------------- |
| The piece is a generic primitive or engine | It knows feature vocabulary or workflows          |
| Two+ features need the same behavior       | Only one screen or dialog uses it                 |
| Positioning/layout is owned by the parent  | The parent must control placement via `className` |

Reusable components should avoid baked-in positioning. Parents pass layout through `className` (or equivalent).

### Pure models

Non-trivial filters, parsers, and validators live in `models/` (or equivalent) as plain modules. That keeps them easy to unit-test and free of React lifecycle concerns.

## UI composition

- Build screens from **shared primitives + feature pieces**, not from one-off mega-components.
- Prefer small presentational components composed by a thin page or dialog.
- Group long style class lists with a small `clsx`/`cn`-style helper.
- Icon-only controls need accessible names (`title` / `aria-label`).
- Dialogs: labelled title, focus restore, Escape to dismiss; prefer the project modal layer over raw primitives for app dialogs.
- With a React Compiler (or similar), do not habitually wrap everything in memoization hooks; use them only when there is a clear need. Prefer stable effect-event patterns for handlers used inside effects.

## State and data hooks

- Query hooks own fetching, caching, and invalidation for server data.
- Mutations invalidate by feature (or broader keys on hard failures).
- Zustand (or similar) owns ephemeral UI and preferences — not remote entity caches.
- Prefer suspense-friendly query patterns where the app already uses them; stay consistent within a project.

## Internationalization

Treat user-visible copy as a first-class surface:

- **Short UI and domain vocabulary** → stable message ids, kept in parity across supported locales.
- **Long content** (help articles, walkthroughs, seed/demo text) → feature-local locale modules, not the short-message catalog.
- Namespace messages by **meaning**, not by file path.
- Map enums to message ids in a feature `labels` module (or equivalent).

Do not leave hardcoded user-facing strings in components when the project is localized.

## Forms and validation

- Prefer schema-driven forms aligned with API schemas where practical.
- Surface validation errors through the same i18n mechanism as other UI copy.
- Keep submit flows in dialogs/pages thin: validate → mutate → invalidate → close.

## Backend style

- One primary model (or focused view concern) per module when files grow.
- Views stay thin; workflows and multi-step side effects go to services.
- Reuse shared permissions and serializers before copying.
- Prefer additive schema evolution.
- Update tests when serializers, permissions, model rules, or endpoints change.

## Testing posture

Test what protects design and contracts — not every presentational wrapper.

| Level         | Focus                                                                                         |
| ------------- | --------------------------------------------------------------------------------------------- |
| Unit          | Pure logic next to the module: parsers, filters, sync helpers, schema edge cases, i18n parity |
| API / backend | Serializers, permissions, model rules, endpoints                                              |
| End-to-end    | Critical user journeys only (auth, main flows, protected routes)                              |

Colocate unit tests with the code they cover. Avoid snapshot-heavy UI tests as the default.

## Commits and change sets

- Prefer small, purposeful changes.
- Use a short type marker in commit subjects when the project does (feature, bugfix, small fix, refactor, docs, infrastructure).
- If a change alters a published or agent-visible contract, update docs and examples in the same change set.
