---
name: rstool-helper
description: RS language and @rsconcept/rstool for AI agents: incremental RSForm construction, formal definitions, typification, diagnostics, modeling, evaluation.
---

# RS Language & rstool — Compact Guide for Agents

**RS language** is a formal scheme notation for concepts, relations, operations—extends FOL, core: membership `x∈y`; typification via set-theoretic/logical expressions.

**rstool** is the agent API for sessions, upserts, analysis, diagnostics, modeling/evaluation, (de)serialization.

- Library: `@rsconcept/rstool` (npm)
- Analyzer: `@rsconcept/domain` (installed automatically as a dependency)
- Language and API reference: bundled `docs/*.md` copied into this skill during installation

## Installing This Skill

After installing the package in an agent project:

```bash
npm install @rsconcept/rstool
```

copy the skill into your agent host's skill directory.

Cursor per-project skills:

```bash
mkdir -p .agents/skills
cp -R node_modules/@rsconcept/rstool/skills/rstool-helper .agents/skills/rstool-helper
cp -R node_modules/@rsconcept/rstool/docs .agents/skills/rstool-helper/docs
```

PowerShell:

```powershell
New-Item -ItemType Directory -Force .agents/skills
Copy-Item -Recurse -Force node_modules/@rsconcept/rstool/skills/rstool-helper .agents/skills/rstool-helper
Copy-Item -Recurse -Force node_modules/@rsconcept/rstool/docs .agents/skills/rstool-helper/docs
```

This makes the skill self-contained for hosts that only read files under the skill directory.

## Docs/Hints Reference

| Info                                      | Location                                                          |
| :---------------------------------------- | :---------------------------------------------------------------- |
| rstool API, methods, error codes          | [REFERENCE.md](REFERENCE.md)                                      |
| Worked examples, common mistakes          | [EXAMPLES.md](EXAMPLES.md)                                        |
| Domain vocabulary (English)               | `docs/DOMAIN.md` (bundled with the npm package)                   |
| Constituenta fields, validation, ordering | `docs/CONSTITUENTA.md`                                            |
| RSLang syntax (operators, quantifiers)    | `docs/SYNTAX.md`                                                  |
| Typification grades, radicals             | `docs/TYPIFICATION.md`                                            |
| Diagnostic code → fix table               | `docs/DIAGNOSTICS.md`                                             |
| Portal REST API (live data)               | `docs/PORTAL-API.md`                                              |
| Lezer grammar pointers                    | `docs/GRAMMAR-REF.md` (full grammar lives in `@rsconcept/domain`) |
| Code samples                              | [EXAMPLES.md](EXAMPLES.md), package README                        |

If you installed `@rsconcept/rstool` from npm, the source docs ship inside `node_modules/@rsconcept/rstool/docs/`; the install commands above copy them into this skill folder.

## Protocol Summary

1. **Start session**: `createSession`
2. **Add bases/constants**: type `basic` (`X*`), `constant` (`C*`) — `definitionFormal: ''`
3. **Add derived**: terms, axioms, etc.—only after dependencies present
4. **Analyze scratch**: `analyzeExpression`
5. **Process diagnostics**: check `analysis.diagnostics`/`listDiagnostics`; fix by range
6. **Checkpoint**: `commitStep` (message optional)
7. **Model values**: `setConstituentaValue` / `setConstituentaValues` for base bindings (`{0:"a",1:"b"}`) or structured values; `getModelState`
8. **Evaluate**: `evaluateExpression` (scratch) or `evaluateConstituenta` / `recalculateModel` (stored definitions)
9. **Export/import**: persist with `exportSession`/`importSession` (includes `state.model`)

**Clients**:

- Node: use `RSToolWrapperClient`
- Stdio process: `npx rstool-wrapper` — JSON per line

## API/REST

For full reference see `docs/PORTAL-API.md`. Short form:

- **Portal UI**: `https://portal.acconcept.ru`
- **API**: `https://api.portal.acconcept.ru`
- Endpoints: `GET /api/rsforms/{id}`, `GET /api/rsforms/{id}/details`, `GET /api/library/{id}/versions/{v}`, `GET /api/oss/{id}`, `GET /api/models/{id}`, OpenAPI at `GET /schema`.
- Don't scrape SPA or use UI query params (`tab=`, etc.).
- rstool itself never calls the REST API; bring data in via `addOrUpdateConstituenta` after fetching.

## Constituent Types (`cstType`)

| cstType   | Example | Formal    | Notes                |
| :-------- | :------ | :-------- | :------------------- |
| basic     | X1      | **empty** | Required             |
| constant  | C1      | **empty** | Required             |
| nominal   | S1      | allowed   | Naming               |
| structure | custom  | allowed   | Structured genus     |
| term      | D1      | allowed   | Set/term             |
| axiom     | A1      | allowed   | Logical (type=Logic) |
| statement | T1      | allowed   | Logical (type=Logic) |
| function  | F1      | allowed   | Parameterized        |
| predicate | P1      | allowed   | Parameterized        |

- Non-empty formal for `basic`/`constant` ⇒ error `0x8862` (`definitionNotAllowed`)
- Empty `basic`/`constant` always typified
- **Interpretable** (can set value): `basic`, `constant`, `structure`, `axiom`, `term`, `statement`
- **Inferrable** (computed, do not set directly): `term`, `axiom`, `statement`

## Syntax

- **Globals**: `X1`, `C1`, `D1`, `F1`, `P1`, `A1`, `R1`
- **Locals**: `x`, `ξ`, `μ2`
- **Literals**: `42`, `Z`, `∅`
- Full operator + precedence table: `docs/SYNTAX.md`
- Grammar pointers: `docs/GRAMMAR-REF.md`

## Expression Types

- **Set-theoretic**: `∪`, `∩`, `\`, `∆`, `×`, `∈`, `⊆`, `ℬ(...)`, tuples
- **Logical**: `¬`, `&`, `∨`, `⇒`, `⇔`, `∀`, `∃`, comparisons `=`, `≠`, `<`
- **Parameterized**: `[arg1∈H1, arg2∈H2] body`
- Detailed semantics in `docs/SYNTAX.md`; typification grades and radicals in `docs/TYPIFICATION.md`.

Always set `cstType` in upserts/analysis to true role.

## Diagnostics Loop

1. Check `analysis.success`
2. If not, see `analysis.diagnostics` / `listDiagnostics`
3. Map `code` → cause → fix via `docs/DIAGNOSTICS.md`
4. Use `from`, `to` to patch `definitionFormal`; re-send

Don’t infer types—always read tool output.

## Declaration Order

1. All `basic`, `constant`
2. Core/critical first
3. Topological: dependencies before dependents (e.g. `D1` before `D2` if `D2` refers to `D1`)
4. Derived right after their sources

## Checklist

- [ ] `sessionId` obtained & tracked
- [ ] Bases/constants are empty formal
- [ ] All dependencies exist before upsert
- [ ] Matching `cstType`
- [ ] Diagnostics handled before commit/export
- [ ] Base bindings set before evaluating expressions that reference base elements
- [ ] For other details, check help topics or [REFERENCE.md](REFERENCE.md)
