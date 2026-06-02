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

Use this when editing or checking schemas and models.

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
11. For user-uploadable Portal files, use `exportPortalSchema` for schema JSON or `exportPortalModel` for model JSON.

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

## Checklist

- [ ] `sessionId` tracked.
- [ ] `cstType` matches the role.
- [ ] Check schema and fix errors before showing result.
- [ ] Diagnostics handled before commit/export.
- [ ] Ambiguous semantics checked on a small model.
- [ ] Base values set before evaluation.
