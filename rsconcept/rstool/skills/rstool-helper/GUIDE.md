# RS Language & rstool — Compact Guide for Agents

**RS language** is a formal scheme notation for concepts, relations, operations—extends FOL, core: membership `x∈y`; typification via set-theoretic/logical expressions.

**rstool** is the agent API for sessions, upserts, analysis, diagnostics, modeling/evaluation, (de)serialization.

- Library: `@rsconcept/rstool` (npm)
- Analyzer: `@rsconcept/domain` (dependency of rstool)
- Language reference: `docs/*.md` next to this package (see table below)

## Docs / hints (canonical paths)

Paths below are relative to **this file** (`skills/rstool-helper/GUIDE.md`).

| Info | Location |
| :--- | :--- |
| rstool API, methods, error codes | [REFERENCE.md](REFERENCE.md) |
| Worked examples, common mistakes | [EXAMPLES.md](EXAMPLES.md) |
| Domain vocabulary (English) | [../../docs/DOMAIN.md](../../docs/DOMAIN.md) |
| Designing/reviewing conceptual schemas (agent recommendations) | [../../docs/CONCEPTUAL-SCHEMA.md](../../docs/CONCEPTUAL-SCHEMA.md) |
| Constituenta fields, validation, ordering | [../../docs/CONSTITUENTA.md](../../docs/CONSTITUENTA.md) |
| RSLang syntax (operators, quantifiers) | [../../docs/SYNTAX.md](../../docs/SYNTAX.md) |
| Typification grades, radicals | [../../docs/TYPIFICATION.md](../../docs/TYPIFICATION.md) |
| Diagnostic code → fix table | [../../docs/DIAGNOSTICS.md](../../docs/DIAGNOSTICS.md) |
| Portal REST API (live data) | [../../docs/PORTAL-API.md](../../docs/PORTAL-API.md) |
| Lezer grammar pointers | [../../docs/GRAMMAR-REF.md](../../docs/GRAMMAR-REF.md) |
| Package README | [../../README.md](../../README.md) |

When working from **npm**, the same tree lives under `node_modules/@rsconcept/rstool/` (use the Read tool on those paths from the project root).

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

For full reference see [../../docs/PORTAL-API.md](../../docs/PORTAL-API.md). Short form:

- **Portal UI**: `https://portal.acconcept.ru`
- **API**: `https://api.portal.acconcept.ru`
- Endpoints: `GET /api/rsforms/{id}`, `GET /api/rsforms/{id}/details`, `GET /api/library/{id}/versions/{v}`, `GET /api/oss/{id}`, `GET /api/models/{id}`, OpenAPI at `GET /schema`.
- Don't scrape SPA or use UI query params (`tab=`, etc.).
- rstool itself never calls the REST API; bring data in via `addOrUpdateConstituenta` after fetching.

## Constituent Types (`cstType`)

| cstType | Example | Formal | Notes |
| :-------- | :------ | :-------- | :-------------------------------------------------------- |
| basic | X1 | **empty** | Required |
| constant | C1 | **empty** | Required |
| nominal | S1 | allowed | Naming |
| structure | S1 | allowed | Typification grade; base concept + `convention` |
| term | D1 | allowed | Formal **definition**; derived concept, computed in model |
| axiom | A1 | allowed | Logical; computed in model; required to be TRUE |
| statement | T1 | allowed | Logical; computed in model |
| function | F1 | allowed | Parameterized; derived concept |
| predicate | P1 | allowed | Parameterized; derived concept |

- Non-empty formal for `basic`/`constant` ⇒ error `0x8862` (`definitionNotAllowed`)
- Empty `basic`/`constant` always typified
- **Interpretable** (can set value): `basic`, `constant`, `structure`
- **Inferrable** (computed, do not set directly): `term`, `axiom`, `statement`

## Structure (`S#`) vs term (`D#`)

The same field `definitionFormal` has **different roles** depending on `cstType`:

| | `structure` (`S#`) | `term` (`D#`) |
| -------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| Role of `definitionFormal` | **Typification** — declares grade `H` (element structure) | **Definition** — declares how the concept is built from suppliers |
| Concept class | **Undefined** — meaning from `convention` (+ axioms on `S#`) | **Derived** — meaning from the expression; no convention required |
| Model interpretation | Values are **assigned** (or constrained by axioms); domain fills `S#` per convention | Value is **computed** via `evaluateConstituenta` / `recalculateModel` |

**Same syntax, different semantics:** in `ℬ(X1×X1)` the fragment `X1×X1` is a **grade** (one ordered pair of base elements). On a **term** with body `X1×X1` alone, `×` builds the **full Cartesian product** — the set of all pairs from `X1`, not a relation typification.

**Agent rule:** for a relation over `X1` (e.g. parent–child), upsert `S1` with `definitionFormal: 'ℬ(X1×X1)'` and a `convention`, then derive terms with projections/filters (`Pr1(S1)`, `Fi2[{ξ}](S1)`, …). Do not use bare `X1×X1` on a `term` when you meant the structure’s typification.

See [EXAMPLES.md](EXAMPLES.md) (kinship-lite) and `../../examples/build-kinship-rsform.ts`.

## Syntax

- **Globals**: `X1`, `C1`, `D1`, `F1`, `P1`, `A1`, `R1`
- **Locals**: `x`, `ξ`, `μ2`
- **Literals**: `42`, `Z`, `∅`
- Full operator + precedence table: [../../docs/SYNTAX.md](../../docs/SYNTAX.md)
- Grammar pointers: [../../docs/GRAMMAR-REF.md](../../docs/GRAMMAR-REF.md)

## Expression Types

- **Set-theoretic**: `∪`, `∩`, `\`, `∆`, `×`, `∈`, `⊆`, `ℬ(...)`, tuples
- **Logical**: `¬`, `&`, `∨`, `⇒`, `⇔`, `∀`, `∃`, comparisons `=`, `≠`, `<`
- **Parameterized**: `[arg1∈H1, arg2∈H2] body`
- Detailed semantics in [../../docs/SYNTAX.md](../../docs/SYNTAX.md); typification grades and radicals in [../../docs/TYPIFICATION.md](../../docs/TYPIFICATION.md).

Always set `cstType` in upserts/analysis to true role.

## Diagnostics Loop

1. Check `analysis.success`
2. If not, see `analysis.diagnostics` / `listDiagnostics`
3. Map `code` → cause → fix via [../../docs/DIAGNOSTICS.md](../../docs/DIAGNOSTICS.md)
4. Use `from`, `to` to patch `definitionFormal`; re-send

Don't infer types—always read tool output.

## Declaration Order

1. All `basic`, `constant`
2. Core/critical first
3. Topological: dependencies before dependents (e.g. `D1` before `D2` if `D2` refers to `D1`)
4. Derived right after their sources

## Natural-language fields: keep one language

When you create new constituents (concepts) or build a schema from scratch, the fields `term`, `definitionText`, and `convention` must be written **in one consistent natural language**:

- If you are extending an existing schema/session, write these fields in the **same language that is already used** in the schema’s text fields.
- If you are creating a new schema from zero, write these fields in the **language of the user’s request**.

## Checklist

- [ ] `sessionId` obtained & tracked
- [ ] Bases/constants are empty formal
- [ ] All dependencies exist before upsert
- [ ] Matching `cstType`
- [ ] Diagnostics handled before commit/export
- [ ] Base bindings set before evaluating expressions that reference base elements
- [ ] For other details, open [REFERENCE.md](REFERENCE.md) or linked `docs/*.md`
