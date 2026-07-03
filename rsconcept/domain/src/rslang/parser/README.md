# RSLang parser pipeline

Lezer grammar (`rslang.grammar`) → generated `parser.ts` / `parser.terms.ts` → `buildTree` →
`normalizeAST` → analysis, diagnostics, evaluation.

## Hybrid AST (intentional)

After `buildTree`, every node carries a numeric `typeID`. There are **two namespaces**:

| Namespace       | Source                    | Examples                                                          | Used when                                                        |
| --------------- | ------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------- |
| Grammar terms   | `parser.terms.ts` (Lezer) | `Setexpr`, `Declarative`, `Logic_quantor`, `Function_decl`        | Raw parse tree; **unchanged** subtrees that still contain errors |
| Semantic tokens | `token.ts` (`TokenID`)    | `NT_DECLARATIVE_EXPR`, `QUANTOR_UNIVERSAL`, `ID_FUNCTION`, `PLUS` | Successfully normalized subtrees                                 |

`normalizeAST` walks the tree and rewrites grammar nodes into `TokenID` shapes (flatten wrappers,
promote literals, attach operator tokens, etc.). It **skips any node whose subtree contains an
`ERROR` node** (`hasError === true`):

```ts
if (node.hasError) {
  return;
}
```

So a single AST is often **hybrid**: valid fragments are already `TokenID` nodes; broken branches
keep grammar `typeID`s and may still contain `[ERROR]` children. This is deliberate — not a bug
and not an intermediate build artifact.

### Why normalize before syntax errors

`RSLangAnalyzer.parse()` always runs `normalizeAST` first, then `extractSyntaxErrors` on the same
tree (`semantic/analyzer.ts`). Reasons:

1. **One tree for the whole pipeline** — type/value auditors, evaluator, and the Portal AST view
   all consume the same structure.
2. **Better diagnostics on valid fragments** — e.g. a malformed tail does not block normalizing
   `F1` to `ID_FUNCTION` or `+` to `PLUS` in the rest of the expression.
3. **Classifiers see both layers** — predicates in `syntax-errors/ast-utils.ts` accept grammar
   _or_ token ids (`Function_decl` / `NT_FUNC_DEFINITION`, `Declarative` / `NT_DECLARATIVE_EXPR`, …)
   because error-containing ancestors are never rewritten.

Do **not** reorder to “errors first, normalize second” without reworking every classifier and the
217+ parser tests.

### What users see on the Portal

**Syntax tree** (`tx.rsexpression.ast`, RS expression editor):

- Default click: `checkFull` → `flattenAst(parse.ast)` → graph labeled with `labelRSLangNode`.
  - Normalized nodes: `DECLARATIVE`, `CALL`, `∀`, identifiers, `[ERROR]`, etc.
  - Skipped subtrees: Lezer names from `node.data.value` (`Setexpr`, `Declarative`, …) — the
    hybrid shape is visible next to semantic labels.
- Ctrl/Cmd+click (debug): raw `buildTree(parser.parse(text))` **without** `normalizeAST` — pure
  grammar tree.

A fully valid expression normalizes entirely to `TokenID`; hybrid trees appear when the expression
has syntax errors (or is incomplete), which matches what error reporting and the tree view show.

## Module map

| Module                         | Role                                                   |
| ------------------------------ | ------------------------------------------------------ |
| `rslang.grammar`               | Syntax definition; run `npm run generate` after edits  |
| `parser.ts`, `parser.terms.ts` | Generated LR parser (do not hand-edit)                 |
| `token.ts`                     | `TokenID` enum for normalized AST                      |
| `normalize.ts`                 | Grammar → `TokenID` transform                          |
| `syntax-errors/`               | Syntax diagnostics (`0x8400`–`0x8423`); see its README |
| `expression-generator.ts`      | Normalized AST → source text (inverse of normalize)    |

## Tests

- `parser.test.ts` — Lezer tree shape (`printTree`) and error codes on the **normalized** AST.
- `normalize.test.ts` — normalized tree shape (`printAst` + `labelRSLangNode`).
