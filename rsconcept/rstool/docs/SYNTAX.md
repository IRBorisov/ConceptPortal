# RSLang syntax reference

Use this when constructing or repairing RSLang expressions. For full grammar tokens see `GRAMMAR-REF.md`. For typification rules see `TYPIFICATION.md`.

## Identifier rules

- **Globals** (concept aliases): uppercase Latin letter + digits — `X1`, `C2`, `S3`, `D11`, `F7`, `P4`, `A6`, `T9`, `N12`. The leading letter must match the constituent's role.
- **Radicals**: identifiers starting with `R` — used inside template parameterised expressions to denote arbitrary typifications (`R1`, `R2`).
- **Locals** (bound variables): lowercase Latin or Greek letter, optionally with digits — `x`, `ξ`, `μ2`, `y1`.
- **Special identifiers** — reserved tokens (`Z`, `∅`, operators).

## Literals

- **Integers**: digit sequence, no negative literal: `0`, `42`. Negation is a binary subtraction `0 - n`.
- **Integer set**: `Z`.
- **Empty set**: `∅` (typification `ℬ(R0)` — set of arbitrary element structure).

## Set-theoretic expressions

| Construct            | Syntax              | Notes                                           |
| -------------------- | ------------------- | ----------------------------------------------- |
| Union                | `D1 ∪ D2`           |                                                 |
| Intersection         | `D1 ∩ D2`           |                                                 |
| Difference           | `D1 \ D2`           |                                                 |
| Symmetric difference | `D1 ∆ D2`           |                                                 |
| Cartesian product    | `X1 × X2`           | typification: tuple                             |
| Boolean / power set  | `ℬ(X1)`             | set of all subsets                              |
| Tuple                | `(a, b, c)`         | ordered, n ≥ 2                                  |
| Enumeration          | `{a, b, c}`         | unordered, n ≥ 1                                |
| Singleton            | `bool(a)` ≡ `{a}`   |                                                 |
| Desingleton          | `debool({a})` ≡ `a` | only for one-element sets                       |
| Sum set              | `red(S1)`           | union of inner sets; `S1` must be a set of sets |
| Small projection     | `pr1((a1, …, an))`  | returns `a1`                                    |
| Large projection     | `Pr1(S1)`           | set of first components of tuples in `S1`       |
| Filter               | `Fi1[D1](S1)`       | subset of `S1` whose first projection ∈ `D1`    |

Indices `1` may be any natural number or comma-separated multi-index (`pr1,3((a1, a2, a3, a4)) = (a1, a3)`, `Fi1,2[D1](S1)`).

## Logical expressions

### Set-theoretic predicates

| Predicate        | Syntax    |
| ---------------- | --------- |
| Membership       | `ξ ∈ S`   |
| Non-membership   | `ξ ∉ S`   |
| Set equality     | `S1 = S2` |
| Set inequality   | `S1 ≠ S2` |
| Inclusion        | `S1 ⊆ S2` |
| Strict inclusion | `S1 ⊂ S2` |
| Non-inclusion    | `S1 ⊄ S2` |

### Arithmetic predicates (typification `Logic`)

`a = b`, `a ≠ b`, `a < b`, `a ≤ b`, `a > b`, `a ≥ b`.

### Connectives

| Connective  | Syntax  |
| ----------- | ------- |
| Negation    | `¬A`    |
| Conjunction | `A & B` |
| Disjunction | `A ∨ B` |
| Implication | `A ⇒ B` |
| Equivalence | `A ⇔ B` |

The constants `TRUE` and `FALSE` are **not** used inside schema explications.

## Quantifiers

| Form          | Syntax                       |
| ------------- | ---------------------------- |
| Universal     | `∀ξ∈STE (LE(ξ))`             |
| Existential   | `∃ξ∈STE (LE(ξ))`             |
| Tuple binding | `∀(ξ1, ξ2)∈STE (LE(ξ1, ξ2))` |
| Variable list | `∀ξ1, ξ2 ∈ STE (LE(ξ1, ξ2))` |

Parentheses around `LE` may be omitted for atomic logical expressions.

## Arithmetic

Operations `a + b`, `a - b`, `a * b` form set-theoretic expressions with typification `Z`. Negative numbers are computed, never literal.

`card(S)` returns the integer cardinality of `S` (always finite in practice).

## Parameterised expressions

### Term-function declaration

```
F1 ::= [α1∈STE1, α2∈STE2(α1)] STE(α1, α2)
```

- Inside `[]` is an ordered list of parameter declarations separated by commas.
- A parameter is declared with `∈`: `local_var ∈ domain`.
- A declared variable can appear in subsequent parameter domains and in the result STE.

### Predicate-function declaration

```
P1 ::= [α1∈STE1, α2∈STE2(α1)] LE(α1, α2)
```

The only difference from a term-function is that the body is a logical expression.

### Calling parameterised functions

`F1[ξ1, S1]`, `P1[ξ1\ξ2, ξ3]` — arguments are positional and listed in square brackets after the function name. Argument typifications are checked against parameter typifications. Result is an STE (term-function) or LE (predicate-function).

### Template expressions

Functions that use radicals as parameter typifications are templates:

```
F2 ::= [α1∈R1×R2, α2∈R1] α2 = pr1(α1)
```

- Radical values are **inferred** from the call-site argument typifications. All inferred values for the same radical index must agree.
- Different radical indices are independent.
- Radicals may only appear in parameter domains — never in the result expression.

## Examples

- `¬α ∈ S1`
- `D1 ∈ S1 ⇒ 2 + 2 = 5`
- `D1 ⊆ D2 ⇔ ∀x∈D1 x∈D2`
- `∀x∈D1 ∃y∈D2 (x, y)∈S1 & (x, x)∈S1`
- `(4 + 5) * 3`, `card(X1) > 5`
- `ℬ(2) = {{}, {1}, {2}, {1, 2}}`
- `pr2((5, 4, 3, 2, 1)) = 4`
- `red({{1, 2, 3}, {3, 4}}) = {1, 2, 3, 4}`
- `Fi2[{2, 4}]({((1, 2), (3, 4), (5, 6))}) = {((1, 2), (3, 4))}`

## Correctness model

- Expression checking happens in the **global context**: known typifications and bijective portability of every referenced identifier. Unknown identifiers are errors.
- Set-theoretic rules follow from bijective portability of the membership predicate — an element must match the typification of the set it is tested against.
- Logical consistency cannot generally be checked automatically. The existence of an interpretation example in a conceptual model is a basis for accepting consistency.
- All formal definitions must be **bijectively portable**: values are independent of any bijective replacement of undefined-concept interpretations.
