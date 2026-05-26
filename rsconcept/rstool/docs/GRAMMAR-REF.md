# Grammar reference (pointers)

The full Lezer grammar ships inside `@rsconcept/domain` at `node_modules/@rsconcept/domain/src/rslang/parser/rslang.grammar`. The generated parser is `parser.ts` in the same folder. Below is a compact token map agents can use without opening the grammar.

## Token classes

| Class | Tokens / examples |
|-------|-------------------|
| Whitespace | space, tab, newline |
| Integer literal | `0`, `42` |
| Empty set | `∅` |
| Integer set | `Z` |
| Globals | `X#`, `C#`, `S#`, `D#`, `F#`, `P#`, `A#`, `T#`, `N#`, `R#` |
| Locals | `x`, `ξ`, `μ2`, `y1` |
| Punctuation | `(`, `)`, `[`, `]`, `{`, `}`, `,`, `;` |
| Comment | none — RSLang has no comments inside formal expressions |

## Set / structural operators

| Token | Symbol |
|-------|--------|
| Union | `∪` |
| Intersection | `∩` |
| Difference | `\` |
| Symmetric difference | `∆` |
| Cartesian product | `×` |
| Boolean | `ℬ` |
| Sum set | `red` |
| Singleton | `bool` |
| Desingleton | `debool` |
| Small projection | `pr1`, `pr1,3`, … |
| Large projection | `Pr1`, `Pr2,4`, … |
| Filter | `Fi1[D](S)`, `Fi1,2[D](S)` |
| Cardinality | `card` |

## Predicates

| Token | Symbol |
|-------|--------|
| Membership | `∈` |
| Non-membership | `∉` |
| Inclusion | `⊆` |
| Strict inclusion | `⊂` |
| Non-inclusion | `⊄` |
| Equality | `=` |
| Inequality | `≠` |
| Less | `<` |
| Less-or-equal | `≤` |
| Greater | `>` |
| Greater-or-equal | `≥` |

## Logical connectives

| Token | Symbol |
|-------|--------|
| Negation | `¬` |
| Conjunction | `&` |
| Disjunction | `∨` |
| Implication | `⇒` |
| Equivalence | `⇔` |

## Quantifiers

| Token | Symbol |
|-------|--------|
| Universal | `∀` |
| Existential | `∃` |

## Declarators

| Token | Form |
|-------|------|
| Function declaration | `F# ::= [<params>] <body STE>` |
| Predicate declaration | `P# ::= [<params>] <body LE>` |
| Parameter declaration | `α ∈ <STE>` (commas separate; commas inside `[]`) |
| Function call | `F#[<arg1>, <arg2>, …]` |

## Precedence (from highest to lowest)

1. Function calls, projections, boolean
2. Cartesian product `×`
3. Multiplicative `*`
4. Additive `+`, `-`
5. Set operators `∪`, `∩`, `\`, `∆`
6. Predicates (`∈`, `=`, `<`, …)
7. Negation `¬`
8. Conjunction `&`
9. Disjunction `∨`
10. Implication `⇒`
11. Equivalence `⇔`

Multi-index tokens inside projections / filters are parsed as a comma-separated list of natural numbers.

## When to consult the full grammar

- Grammar conflicts or surprising error positions — read `rslang.grammar` directly.
- Adding new operators or precedence rules — must be done in the domain package, not in rstool.
- Lezer terms / token IDs — see `@rsconcept/domain/src/rslang/parser/token.ts` and `parser.terms.ts`.
