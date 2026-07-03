# Syntax error reporting

Turns Lezer `ERROR` nodes and raw expression text into `RSErrorDescription` values
(codes `0x8400`–`0x8423`, see `rstool/docs/DIAGNOSTICS.md`).

**Input AST:** always **after** `normalizeAST` (see [../README.md](../README.md#hybrid-ast-intentional)).
Classifiers must handle both grammar terms (`parser.terms`) and `TokenID` values on the same tree.

## Pipeline (`index.ts`)

1. **Forbidden characters** — scan the source string; if any illegal symbol is found, report only those errors and stop.
2. **AST walk** — for each `ERROR` node, run classifiers (`classify.ts`) or fall back to `unknownSyntax` / `expectedLocal`.
3. **Bracket pass** — one expression-level bracket diagnostic (`missingCloseBracket`, `bracketMismatch`, …), unless an incomplete D/I/R body was already reported (generator may legally end with `}` while brackets look wrong).
4. **Deduplication** — drop overlaps; prefer specific codes over `unknownSyntax`; keep a single `unknownSyntax` when several ERROR nodes fire.

`options.expected` (`TypeClass`) refines incomplete formal headers: `[α∈X1]` → `expectedLogicBody` vs `expectedExpressionBody`.

## Classifier chain (`classify.ts`)

Order matters — first match wins:

| Priority | Module                   | Codes (examples)                                                             |
| -------- | ------------------------ | ---------------------------------------------------------------------------- |
| 1        | `incomplete-formal.ts`   | `expectedFunctionBody`, `expectedQuantifierBody`, `expectedQuantifierDomain` |
| 2        | `generators.ts`          | `expectedDeclarativeBody`, `expectedImperativeBody`, `expectedRecursiveBody` |
| 3        | `incomplete-operands.ts` | `expectedRightOperand`, `expectedUnaryOperand` (skipped when bracket errors) |
| 4        | `incomplete-operands.ts` | `expectedArgument` — only `F[…]` / `P[…]` lists, not tuples                  |
| 5        | `function-calls.ts`      | `invalidFilterSyntax`, `globalFuncWithoutArgs`, `globalFuncParenCall`        |

Fallback: `expectedLocal` under `Variable`; otherwise `unknownSyntax` (`0x8400`).

## Shared patterns

- **`trailing-slot.ts`** — header parsed, last child is `ERROR`, input ends: `[α∈X1]`, `∀α∈X1`, etc.
- **`whenNoBracketErrors`** (`context.ts`) — operand/argument classifiers must not compete with bracket diagnostics.
- **`expression-errors.ts`** — text-level checks independent of AST shape.
- **`ast-utils.ts` predicates** — `isFunctionDeclNode`, `isFilterNode`, … match grammar **or** token
  `typeID` because `normalizeAST` does not rewrite `hasError` subtrees.

## Adding a new error code

1. Add `RSErrorCode` in `rslang/error.ts` and strings in frontend i18n + `DIAGNOSTICS.md`.
2. Implement `ErrorClassifier` in the appropriate module (or new file).
3. Register it in `PARSE_ERROR_CLASSIFIERS` in `classify.ts` at the right priority.
4. Add cases to `parser.test.ts` (`testSpecifiedSyntaxData` / `testUnknownSyntaxData`).

## File map

| File                     | Role                                                        |
| ------------------------ | ----------------------------------------------------------- |
| `index.ts`               | Public API: `extractSyntaxErrors`                           |
| `classify.ts`            | Classifier registry + fallback                              |
| `context.ts`             | `ClassifyContext`, `ErrorClassifier`, `whenNoBracketErrors` |
| `trailing-slot.ts`       | Reusable incomplete-trailing-body detector                  |
| `ast-utils.ts`           | Tree navigation, node predicates, bracket matching          |
| `error-builders.ts`      | `errorAt`, text-token helpers                               |
| `expression-errors.ts`   | Forbidden chars, brackets, dedup                            |
| `incomplete-formal.ts`   | `[…]` declarations, quantifiers                             |
| `incomplete-operands.ts` | Operators, `ℬ()`, bracket argument lists                    |
| `generators.ts`          | D{…}, I{…}, R{…} incomplete bodies                          |
| `function-calls.ts`      | Fi, F/P call syntax                                         |
