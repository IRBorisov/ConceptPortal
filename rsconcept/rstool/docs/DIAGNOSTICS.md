# Diagnostics reference

Use this when an `analyzeExpression` / `addOrUpdateConstituenta` call returns errors in `result.diagnostics`.

## How to read a diagnostic

Each `DiagnosticRecord` carries:

- `code` — numeric `RSErrorCode` (see table). The high nibble identifies the class (`0x82xx` lexer, `0x84xx` parser, `0x88xx` semantic, `0x81xx` runtime, `0x28xx` warnings).
- `params` — substitution arguments for the message (identifier names, sets, etc.).
- `from`, `to` — character positions in the _expression text_ that should be patched. Always edit `definitionFormal` by range.
- `constituentId` — present in session diagnostics from `listDiagnostics`.

Resolve `code` from **`@rsconcept/domain`** (installed: `node_modules/@rsconcept/domain/src/rslang/error.ts`):

- **`RSErrorCode`** — reverse-lookup the numeric value to its symbol name (`missingParenthesis`, `globalNotTyped`, …). The identifier is the canonical error kind; inline comments on each member document the hex id.
- **`getRSErrorPrefix(code)`** — short label with class + hex (`P8406`, `S8803`, …).
- **`params`** — substitution arguments from the reporter (see `*.test.ts` cases in `domain/src/rslang/` for examples per code).
- **Tables below** — typical causes and agent fixes when patching `definitionFormal`.

## Class table

| Mask            | Class                | Behaviour                                                                      |
| --------------- | -------------------- | ------------------------------------------------------------------------------ |
| `0x8400` family | Parser               | Lexical / syntactic problems; expression cannot be analysed further            |
| `0x8800` family | Semantic             | Definition-level issues (types, scopes, structure)                             |
| `0x8100` family | Runtime / evaluation | Raised during `evaluateExpression` / `evaluateConstituenta`                    |
| `0x2800` family | Warning              | Not critical; expression still valid                                           |
| `0x88Cx`        | Schema-level         | Rules enforced by the schema layer (`cstEmptyDerived`, `definitionNotAllowed`) |

`isCritical(code)` returns `false` only for `localDoubleDeclare` and `localNotUsed`.

## High-priority codes

### Parser

| Code     | Symbol                 | Typical cause                        | Agent fix                       |
| -------- | ---------------------- | ------------------------------------ | ------------------------------- |
| `0x8400` | `unknownSyntax`        | Stray token / typo                   | Re-tokenise around `from`–`to`  |
| `0x8406` | `missingParenthesis`   | Unmatched `(` `)`                    | Insert matching paren near `to` |
| `0x8407` | `missingCurlyBrace`    | Unmatched `{` `}`                    | Insert matching brace           |
| `0x8408` | `missingSquareBracket` | Unmatched `[` `]`                    | Insert matching bracket         |
| `0x8409` | `bracketMismatch`      | Mixed bracket types                  | Replace one bracket to match    |
| `0x840A` | `doubleParenthesis`    | `(( ... ))` redundancy               | Remove one pair                 |
| `0x840B` | `missingOpenBracket`   | Closing bracket without opener       | Insert opening bracket earlier  |
| `0x8415` | `expectedLocal`        | Quantifier or filter expects a local | Provide a lowercase variable    |
| `0x8416` | `expectedType`         | Missing typification annotation      | Add explicit grade              |

### Semantic — locals and scopes

| Code     | Symbol               | Typical cause                    | Agent fix                       |
| -------- | -------------------- | -------------------------------- | ------------------------------- |
| `0x8801` | `localUndeclared`    | Variable used before declaration | Bind via quantifier / parameter |
| `0x8802` | `localShadowing`     | Local redeclared in inner scope  | Rename inner variable           |
| `0x8815` | `localOutOfScope`    | Local escapes its binder         | Move usage inside the binder    |
| `0x2801` | `localDoubleDeclare` | Same local declared twice        | Warning; rename                 |
| `0x2802` | `localNotUsed`       | Declared local never referenced  | Warning; remove or use          |

### Semantic — types

| Code     | Symbol                          | Typical cause                                          | Agent fix                                           |
| -------- | ------------------------------- | ------------------------------------------------------ | --------------------------------------------------- |
| `0x8803` | `typesNotEqual`                 | Operands have different typifications                  | Convert / project to matching grade                 |
| `0x8804` | `globalNotTyped`                | Referenced global has no typification                  | Ensure dependency is upserted and typechecked first |
| `0x8805` | `invalidDecart`                 | Cartesian product on non-set operand                   | Wrap operand in `ℬ(...)` if appropriate             |
| `0x8806` | `invalidBoolean`                | `ℬ(...)` applied to a non-set                          | Use a set-grade operand                             |
| `0x8807` | `invalidTypeOperation`          | Operator not defined for these types                   | Re-check the typification table                     |
| `0x8808` | `invalidCard`                   | `card(...)` on a non-set                               | Use a set operand                                   |
| `0x8809` | `invalidDebool`                 | `debool(...)` on non-singleton                         | Ensure exactly one element first                    |
| `0x880B` | `globalFuncWithoutArgs`         | Calling a function without `[]` args                   | Provide arguments                                   |
| `0x8810` | `invalidReduce`                 | `red(...)` on something not `ℬ(ℬ(...))`                | Wrap in extra `ℬ` or change source                  |
| `0x8811` | `invalidProjectionTuple`        | `pr_i((a,b))` with out-of-range index                  | Use valid index                                     |
| `0x8812` | `invalidProjectionSet`          | `Pr_i(S)` on non-tuple set                             | Use a tuple-set source                              |
| `0x8813` | `invalidEnumeration`            | `{a, b}` with incompatible element types               | Match element typifications                         |
| `0x8814` | `invalidCortegeDeclare`         | Tuple declaration with mismatched arity                | Match declaration to use                            |
| `0x8816` | `invalidElementPredicate`       | `ξ ∈ S` typification mismatch                          | Match `ξ`'s grade to elements of `S`                |
| `0x8817` | `invalidEmptySetUsage`          | `∅` in a position that needs a concrete element        | Provide explicit typified operand                   |
| `0x8818` | `invalidArgsArity`              | Wrong number of arguments to function                  | Match function declaration                          |
| `0x8819` | `invalidArgumentType`           | Argument typification mismatch                         | Adjust caller or function signature                 |
| `0x881C` | `globalStructure`               | Wrong structural shape of referenced global            | Re-check `structure` constituent shape              |
| `0x8821` | `radicalUsage`                  | Radical used outside parameter domain                  | Move usage into parameter declarations              |
| `0x8822` | `invalidFilterArgumentType`     | `Fi[D](S)` parameter does not match index typification | Match `D` to projected grade                        |
| `0x8823` | `invalidFilterArity`            | Filter parameter count ≠ multi-index length            | Align lengths                                       |
| `0x8824` | `arithmeticNotSupported`        | Arithmetic operator outside integer context            | Use integer expressions                             |
| `0x8825` | `typesNotCompatible`            | Generic type incompatibility                           | Re-examine surrounding context                      |
| `0x8826` | `orderingNotSupported`          | `<`, `≤` etc. used outside integer                     | Ensure operands are integers                        |
| `0x8827` | `expectedLogic`                 | Definition where `Logic` is required                   | Wrap in logical expression or change `cstType`      |
| `0x8828` | `expectedSetexpr`               | Definition where STE required                          | Convert from logic to set expression                |
| `0x8829` | `invalidArgumentCortegeDeclare` | Tuple parameter declaration mismatch                   | Match tuple arity in declaration                    |

### Schema / cstType validation

| Code     | Symbol                 | Trigger                                                | Fix                                                    |
| -------- | ---------------------- | ------------------------------------------------------ | ------------------------------------------------------ |
| `0x8861` | `cstEmptyDerived`      | Derived constituent with empty `definitionFormal`      | Provide a definition                                   |
| `0x8862` | `definitionNotAllowed` | `basic`/`constant` with non-empty formal               | Clear the formal                                       |
| `0x8840` | `globalNoValue`        | Reference to global without a model value              | Set value via `setConstituentaValue` before evaluating |
| `0x8841` | `invalidPropertyUsage` | Property-only constituent used where value is required | Use a different operand                                |

### Runtime (evaluation)

| Code     | Symbol                    | Cause                                    |
| -------- | ------------------------- | ---------------------------------------- |
| `0x8100` | `calcUnknownError`        | Unspecified evaluation failure           |
| `0x8101` | `setOverflow`             | Intermediate set too large               |
| `0x8102` | `booleanBaseLimit`        | `ℬ(X)` overflow at runtime               |
| `0x8103` | `calcGlobalMissing`       | Referenced global has no current value   |
| `0x8104` | `iterationsLimit`         | Iterative computation exceeded limit     |
| `0x8105` | `calcInvalidDebool`       | `debool` on multi-element set at runtime |
| `0x8106` | `iterateInfinity`         | Iteration over an infinite set           |
| `0x8107` | `calculationNotSupported` | Construct cannot be evaluated            |

## Common agent mistakes

- **Setting a value on a derived constituent**: derived `term`, `axiom`, `statement` are inferrable. Use `evaluateConstituenta` / `recalculateModel`. Setting them throws `Constituent <alias> is inferrable and cannot be set directly`.
- **Forgetting empty formal on `basic` / `constant`**: results in `definitionNotAllowed`. Pass `definitionFormal: ''`.
- **Out-of-order dependencies**: referencing `D2` before upserting it raises `localUndeclared` or `globalNotTyped`. Always topologically sort.
- **Wrong cstType for the role**: `axiom`/`statement` whose definition is not `Logic` raises `expectedLogic`. A `term` whose body is logical raises `expectedSetexpr`.
- **Negative literals**: `-5` does not parse. Use `0 - 5`.
- **Radicals in result expressions**: `[α∈R1] (α, R1)` raises `radicalUsage`. Use radicals only in parameter domains.
- **Evaluating before bindings are set**: `evaluateExpression` referencing `X1` without a `setConstituentaValue(..., target: <X1.id>)` raises `calcGlobalMissing` (`0x8103`).

## Diagnostics loop

1. Run `analyzeExpression` on a scratch.
2. If `analysis.success === false`, iterate `analysis.diagnostics`.
3. For each diagnostic: read `code`, `from`, `to`, and `params`. Look up `code` in `RSErrorCode` (`error.ts`) and use `getRSErrorPrefix` if you need a display id.
4. Patch `definitionFormal` based on the range — never blindly retry without changing the input.
5. Re-send. Repeat until success.
6. Only then call `addOrUpdateConstituenta` to commit the constituent into the session.
