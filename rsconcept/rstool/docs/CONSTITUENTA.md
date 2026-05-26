# Constituenta reference

Distilled from `help-cst-attributes`, the rstool skill table, and `CONTEXT.md`. Use this when upserting constituents via `addOrUpdateConstituenta`.

## `ConstituentaDraft` fields

| Field | Required | Description |
|-------|----------|-------------|
| `id` | yes | Stable integer id within the session |
| `alias` | yes | Display alias (`X1`, `D5`, `F2`) — must match `cstType` prefix |
| `cstType` | yes | One of `CstType` values (see table below) |
| `definitionFormal` | yes (may be empty) | RS expression. Empty for `basic` / `constant` |
| `term` | optional | Natural-language term name |
| `definitionText` | optional | Natural-language definition / interpretation |
| `convention` | optional | Convention text for undefined concepts |

Omitted text fields default to `''` in stored state.

## `cstType` table

| `cstType` (value) | Prefix | Formal definition | Notes |
|-------|--------|-------|-------|
| `basic` (`X`) | `X#` | **must be empty** | Base set; non-empty formal → `definitionNotAllowed` |
| `constant` (`C`) | `C#` | **must be empty** | Constant set; same rule |
| `nominal` (`N`) | `N#` | allowed | Free vocabulary item, no semantic constraint |
| `structure` (`S`) | `S#` | allowed | Structured undefined concept, defines the typification grade |
| `term` (`D`) | `D#` | allowed | Derived term (set / value) |
| `axiom` (`A`) | `A#` | allowed (must be `Logic`) | Logical statement asserting a requirement |
| `statement` (`T`) | `T#` | allowed (must be `Logic`) | Logical assertion about the model |
| `function` (`F`) | `F#` | allowed (parameterised) | Term-function |
| `predicate` (`P`) | `P#` | allowed (parameterised) | Predicate-function |

### Interpretability and inferrability

- **Interpretable** (a value can be assigned via `setConstituentaValue`): `basic`, `constant`, `structure`, `term`, `axiom`, `statement`.
- **Inferrable** (computed from definitions, never set directly): `term`, `axiom`, `statement`. Assigning to an inferrable raises an error.

In practice, agents only set values for `basic` and `constant` constituents (and `structure` when an explicit value is required). Everything else is recalculated via `evaluateConstituenta` / `recalculateModel`.

## Validation rules

1. **Prefix ↔ `cstType`**: `alias` letter must match the type prefix.
2. **Empty formal for undefined concepts**: `basic` and `constant` must have `definitionFormal === ''`. Any non-empty value triggers `definitionNotAllowed` (`0x8862`).
3. **Dependency declaration order**: every global identifier referenced in `definitionFormal` must correspond to an already-upserted constituent in the session.
4. **Logical-only definitions**: `axiom` and `statement` definitions must typecheck to `Logic`; otherwise `expectedLogic`.
5. **Empty derived expression**: a derived constituent with empty `definitionFormal` triggers `cstEmptyDerived`.

## Recommended upsert order

1. All `basic` (`X#`) and `constant` (`C#`) constituents (empty formal).
2. Core `structure` (`S#`) and crucial concepts.
3. Topological order of derived concepts: every dependency upserted before its dependent.
4. Axioms and statements after the constituents they reference.

Use `analyzeExpression` on a scratch expression before upsert; use `addOrUpdateConstituenta` only when the expression typechecks. Read `result.diagnostics` for actionable error info and patch by `from`/`to` ranges.
