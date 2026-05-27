# Constituenta reference

Use this when upserting constituents via `addOrUpdateConstituenta`.

## `ConstituentaDraft` fields

| Field              | Required           | Description                                                    |
| ------------------ | ------------------ | -------------------------------------------------------------- |
| `id`               | yes                | Stable integer id within the session                           |
| `alias`            | yes                | Display alias (`X1`, `D5`, `F2`) — must match `cstType` prefix |
| `cstType`          | yes                | One of `CstType` values (see table below)                      |
| `definitionFormal` | yes (may be empty) | RS expression. Empty for `basic` / `constant`                  |
| `term`             | optional           | Natural-language term name                                     |
| `definitionText`   | optional           | Natural-language definition / interpretation                   |
| `convention`       | optional           | Convention text for undefined concepts                         |

Omitted text fields default to `''` in stored state.

## Language of text fields

The natural-language fields `term`, `definitionText`, and `convention` should be written in **one consistent language**:

- When editing/extending an existing schema, keep the **same language** that is already used in the schema’s text fields.
- When creating a new schema from scratch, use the **language of the user’s request**.

## `cstType` table

| `cstType` (value) | Prefix | Formal definition         | Notes                                                                                             |
| ----------------- | ------ | ------------------------- | ------------------------------------------------------------------------------------------------- |
| `basic` (`X`)     | `X#`   | **must be empty**         | Base set; non-empty formal → `definitionNotAllowed`                                               |
| `constant` (`C`)  | `C#`   | **must be empty**         | Constant set; same rule                                                                           |
| `nominal` (`N`)   | `N#`   | allowed                   | Free vocabulary item, no semantic constraint                                                      |
| `structure` (`S`) | `S#`   | allowed                   | **Base** structured concept; `definitionFormal` is its **typification** (grade), not a definition |
| `term` (`D`)      | `D#`   | allowed                   | **Derived** concept; `definitionFormal` is its **definition** (value computed in the model)       |
| `axiom` (`A`)     | `A#`   | allowed (must be `Logic`) | Logical statement asserting a requirement                                                         |
| `statement` (`T`) | `T#`   | allowed (must be `Logic`) | Logical assertion about the model                                                                 |
| `function` (`F`)  | `F#`   | allowed (parameterised)   | Term-function                                                                                     |
| `predicate` (`P`) | `P#`   | allowed (parameterised)   | Predicate-function                                                                                |

### Interpretability and inferrability

- **Interpretable** (a value can be assigned via `setConstituentaValue`): `basic`, `constant`, `structure`.
- **Inferrable** (computed from definitions, never set directly): `term`, `axiom`, `statement`. Assigning to an inferrable raises an error.

## Structure (`S#`) vs term (`D#`)

Do not treat `structure` and `term` as interchangeable because both may contain `×`, `ℬ`, or projections.

|                    | `structure` (`S#`)                                                                          | `term` (`D#`)                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `definitionFormal` | **Typification** — which grade the elements have (e.g. `ℬ(X1×X1)` = set of pairs over `X1`) | **Definition** — how to obtain the concept (e.g. `Pr1(S1)` = first projection of relation `S1`)      |
| Introduction       | `convention` (+ optional axioms); interpretation from the subject domain                    | Formal expression only; interpretation is **evaluated**                                              |
| `X1×X1` in context | Inside a grade: **one** pair type `(X1, X1)`                                                | As the whole body: **Cartesian product** `X1 × X1` (all pairs) — rarely what you want for a relation |

**Typical pattern (relation over a base set):**

1. `X1` — base set, empty formal, `convention` names the domain elements.
2. `S1` — `definitionFormal: 'ℬ(X1×X1)'`, `convention` explains pair order (e.g. parent, child).
3. `D1` — `definitionFormal: 'Pr1(S1)'` (or filters / term-functions), `definitionText` explains the derived set.

Worked example: `examples/build-kinship-rsform.ts`.

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
