# RS Language & rstool

Compact entry guide for agents. Keep details in linked docs.

**RSLang** is a formal notation for conceptual schemas: concepts, relations, operations, assertions. Core ideas: membership `x∈y`, set-theoretic expressions, logical expressions, typification.

**rstool** is the agent API for sessions, upserts, analysis, diagnostics, model values, evaluation, export/import.

- Library: `@rsconcept/rstool`.
- Analyzer: `@rsconcept/domain`.
- Stdio wrapper: `npx rstool-wrapper`, JSON per line.
- Node client: `RSToolWrapperClient`.

## What to Read

Paths are relative to this file.

- API, methods, stdio, error codes: [REFERENCE.md](REFERENCE.md).
- Worked examples and pitfalls: [EXAMPLES.md](EXAMPLES.md).
- Domain terms: [../../docs/DOMAIN.md](../../docs/DOMAIN.md).
- Schema design rules: [../../docs/CONCEPTUAL-SCHEMA.md](../../docs/CONCEPTUAL-SCHEMA.md).
- Constituents and validation: [../../docs/CONSTITUENTA.md](../../docs/CONSTITUENTA.md).
- Syntax: [../../docs/SYNTAX.md](../../docs/SYNTAX.md).
- Typification: [../../docs/TYPIFICATION.md](../../docs/TYPIFICATION.md).
- Definition testing with small conceptual models: [../../docs/MODEL-TESTING.md](../../docs/MODEL-TESTING.md).
- Diagnostics: [../../docs/DIAGNOSTICS.md](../../docs/DIAGNOSTICS.md).
- Portal REST reads: [../../docs/PORTAL-API.md](../../docs/PORTAL-API.md).
- Grammar pointers: [../../docs/GRAMMAR-REF.md](../../docs/GRAMMAR-REF.md).

## Workflow

1. `createSession`.
2. Add `basic` (`X#`) and `constant` (`C#`) with `definitionFormal: ''`.
3. Add dependencies before dependents.
4. Use `analyzeExpression` before upsert when unsure.
5. When unsure about semantics, build a tiny conceptual model and evaluate test data.
6. Fix diagnostics by `from` / `to` range in `definitionFormal`.
7. `commitStep` when the state is coherent.
8. Set base/model values with `setConstituentaValue(s)`.
9. Evaluate with `evaluateExpression`, `evaluateConstituenta`, or `recalculateModel`.
10. Persist with `exportSession` / `importSession`.

## Portal REST

rstool never calls Portal REST itself. Fetch live data outside rstool, then import constituents with `addOrUpdateConstituenta`.

- UI host: `https://portal.acconcept.ru`.
- API host: `https://api.portal.acconcept.ru`.
- Useful reads: `/api/rsforms/{id}`, `/api/rsforms/{id}/details`, `/api/library/{id}/versions/{v}`, `/api/oss/{id}`, `/api/models/{id}`, `/schema`.
- Do not scrape SPA HTML or reuse UI query params like `?tab=`.

## Syntax Cheatsheet

- Globals: `X1`, `C1`, `S1`, `D1`, `F1`, `P1`, `A1`, `T1`, `N1`, `R1`.
- Locals: `x`, `ξ`, `μ2`.
- Literals: `42`, `Z`, `∅`.
- Set expressions: `∪`, `∩`, `\`, `∆`, `×`, `ℬ(...)`, tuples, `Pr*`, `Fi*`.
- Logic: `¬`, `&`, `∨`, `⇒`, `⇔`, `∀`, `∃`, `=`, `≠`, `<`, `∈`, `⊆`.
- Parameterized expressions: `[arg1∈H1, arg2∈H2] body`.

Read tool output; do not infer types by inspection.

## Diagnostics Loop

1. Check `analysis.success`.
2. If false, read `analysis.diagnostics` or `listDiagnostics`.
3. Map `code` to a fix in `DIAGNOSTICS.md`.
4. Patch the reported `from` / `to` range.
5. Re-run only after changing input.

## Declaration Order

1. `basic`, `constant`.
2. Core structures and key concepts.
3. Derived constituents in topological order.
4. Axioms and statements after their references.

## Natural-Language Fields

Keep `term`, `definitionText`, and `convention` in one language.

- Extending a schema: use the schema's existing language.
- New schema: use the user's request language.

## Checklist

- [ ] `sessionId` tracked.
- [ ] `basic` / `constant` formals are empty.
- [ ] Dependencies exist before upsert.
- [ ] `cstType` matches the role.
- [ ] Diagnostics handled before commit/export.
- [ ] Ambiguous semantics checked on a small model when data examples are available.
- [ ] Base values set before evaluation.
