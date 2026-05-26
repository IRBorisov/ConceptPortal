# Typification reference

Distilled from `help-rslang-typification`, `help-rslang-expression-structure`, and `help-rslang-expression-parameter`. Agents must understand grades to interpret `AnalysisResult.type` and to construct correct expressions.

## Grades

A genus-structure expression `ξ` has typification (a *structure*) if `ξ ∈ H` holds, where `H` is a valid **grade**. Grades are built recursively:

| Grade | Form | Notes |
|-------|------|-------|
| Element | `Xi`, `Ci` | grade of an undefined concept's elements |
| Integer | `Z` | grade of integer arithmetic results |
| Tuple of arity n | `(H1 × H2 × … × Hn)` | ordered structured grade |
| Set | `ℬ(H)` | set of values of grade `H` |

The empty set `∅` has typification `ℬ(R0)` — a set with arbitrary element structure. The radical `R0` ensures it conforms to any element grade in context.

## Extended typifications

Beyond set-theoretic grades, RSLang uses two additional grade-like markers:

- **Logic** — typification of logical expressions (axioms, statements, predicate bodies) that evaluate to TRUE or FALSE.
- **Parameterised** — typification of term-functions and predicate-functions:

  ```
  Hr 🠔 [H1, H2, …, Hi]
  ```

  where `Hr` is the result typification (an STE grade or `Logic`) and `H1 … Hi` are the argument typifications.

## Radicals

Template parameterised expressions may contain notations `R1, R2, …` (and `R0` for `∅`). Each radical corresponds to an arbitrary grade that is **inferred** from the typifications of the arguments at the point of use.

- All occurrences of the same radical index must resolve to the same grade.
- Radicals with different indices are independent.
- Radicals may only appear in parameter domains, **not in the result expression**.

## Encoded shape in `AnalysisResult.type`

The contract exposes `type: Record<string, unknown> | null` because typifications are JSON-encoded by the analyzer. Useful properties exposed by `@rsconcept/domain` helpers:

- `TypeID` enum: `Element`, `Integer`, `Tuple`, `Boolean`, `Logic`, `Functional` — discriminates the top-level shape.
- `TypeClass` enum: `Element`, `Integer`, `Logic`, `Functional`, `Collection` (set / tuple), `Other`.
- `TypePath` (sequence of indices) addresses positions inside a tuple-of-sets-of-tuples structure; use `makeTypePath` to construct.
- `parseTypeText(...)` parses an ASCII representation `B(X1)`, `(X1×X2)`, etc., into a `Typification`.

For agents inspecting types from rstool output:

1. Check `analysis.success === true` and `analysis.type !== null`.
2. Use `analysis.type` (object) only as opaque input to `@rsconcept/domain` helpers — do not pattern-match it manually.
3. The `valueClass` companion indicates `Value`, `Property` (non-computable membership only), or `Invalid`.

## Forming structures vs. derived structures

Forming operations build a new grade:

- `ℬ(H)` — power set
- `H1 × H2` — Cartesian product
- `(a, b, c)` — tuple
- `{a, b, c}` — enumeration
- `bool(a)` — singleton

Derived structures consume a grade:

- `red(S)` — union of inner sets; requires `S : ℬ(ℬ(H))`
- `debool({a})` — extracts the single element of a singleton
- `pr1((a1, …, an))`, `Pr1(S)` — projections (multi-indices allowed: `pr1,3`, `Pr2,4`)
- `Fi1[D](S)` — filters by membership in `D`; multi-index variants must match parameter arity

## Common typification pitfalls

- Negative integer literals do not exist — use `0 - n`.
- `debool(S)` fails if `S` is not a singleton.
- `red(S)` fails unless `S : ℬ(ℬ(H))`.
- Tuple projections require the argument to be a tuple of sufficient arity; `pr3((a, b))` is an error.
- Filter parameter list arity must match the multi-index in `Fi[...]`.
- A radical in the **result expression** of a template is a hard error (`radicalUsage`).
- An `axiom` or `statement` must have typification `Logic`; non-logical formal definitions raise `expectedLogic`.
