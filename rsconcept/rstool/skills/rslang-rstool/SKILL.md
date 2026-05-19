---
name: rslang-rstool
description: Explains RS language (formal explication for conceptual schemes) and how AI agents build and validate RSForm incrementally via rsconcept/rstool. Use when writing formal definitions, constituents, RSLang expressions, typification, diagnostics, or integrating the RSForm agent tool.
---

# RS language and rstool (agents)

## What this is

**RS language** (родоструктурная экспликация) is Portal’s formal notation for concepts, relations, and operations in conceptual schemes. It extends first-order logic; membership `x∈y` is central. Set-theoretic expressions denote elements of a **grade** (typification); logical expressions denote `TRUE` / `FALSE`.

**rstool** (`rsconcept/rstool`) is the agent-facing API: session state, constituent upserts, expression analysis, diagnostics, export/import. It reuses the same analyzer as the frontend (`rsconcept/frontend/src/domain/rslang`).

Domain vocabulary: `CONTEXT.md` (RS language, typification, constituenta, RSForm).

## When to read more

| Need | Open |
|------|------|
| Operators, grammar tokens, full API, error codes | [REFERENCE.md](REFERENCE.md) |
| Human-oriented help (examples, typification rules) | `rsconcept/frontend/src/features/help/items/rslang/` and `.../root/help-rslang/` |
| Runnable examples | `rsconcept/rstool/examples/`, `rsconcept/rstool/README.md` |

## Agent workflow (rstool)

1. **Create session** — `createSession` (or `RSFormAgentTool.createSession()` in-process).
2. **Declare bases first** — `basic` (`X*`) and `constant` (`C*`) with **empty** `definitionFormal`.
3. **Add derived constituents** — terms, axioms, functions, etc., in **dependency order** (each alias must refer only to constituents already in the session).
4. **Probe expressions** — `analyzeExpression` for scratch checks without adding a row.
5. **Fix from diagnostics** — `listDiagnostics`; each error has `code`, `from`, `to`, optional `params`.
6. **Checkpoint** — `commitStep` with a short message.
7. **Persist** — `exportSession` JSON; resume with `importSession`.

Run from `rsconcept/rstool`:

```bash
npm test
npm run example:client
npm run example:build-sample
```

**Stdio wrapper** (long-lived process): `npm run wrapper` — one JSON request per line, one JSON response per line; first line is `{ "ok": true, "result": { "ready": true, ... } }`.

**Typed client** (spawn wrapper from Node):

```ts
import { CstType, RSToolWrapperClient } from '@rsconcept/rstool';

const client = new RSToolWrapperClient({ cwd: 'D:/DEV/WORK/Portal/rsconcept/rstool' });
await client.waitUntilReady();
const { sessionId } = await client.call<{ sessionId: string }>('createSession');
await client.call('addOrUpdateConstituenta', {
  sessionId,
  input: { draft: { id: 1, alias: 'X1', cstType: CstType.BASE, definitionFormal: '' } }
});
```

MCP/HTTP adapters in rstool are **not implemented**; use library API or stdio/client.

## Constituent types (`cstType`)

| `cstType` | Alias pattern (typical) | Formal definition |
|-----------|-------------------------|-------------------|
| `basic` | `X1`, `X2` | Must be **empty** |
| `constant` | `C1` | Must be **empty** |
| `nominal` | `S1` | Allowed (naming) |
| `structure` | structured genus | Allowed |
| `term` | `D1` | Allowed (set-theoretic / term) |
| `axiom`, `statement` | `A1`, `T1` | Logical (`Logic` typification) |
| `function` | `F1` | Parameterized |
| `predicate` | `P1` | Parameterized |

Empty `basic` / `constant` still get typification analysis (success with a base type). Non-empty formal on `basic` / `constant` → error `0x8862` (`formalDefinitionNotAllowed`).

## Identifiers (minimal)

- **Concepts (globals)**: uppercase Latin + digits by role — `X1` (base), `C1` (constant), `D1` (term), `F1` / `P1` (function/predicate), `A1` (axiom), `R1` (radical in templates).
- **Locals**: lowercase Greek/Latin + optional digits — `x`, `ξ`, `μ2`.
- **Literals**: non-negative integers (`42`), `Z`, `∅`.

Grammar source: `rsconcept/frontend/src/domain/rslang/parser/rslang.grammar`.

## Expression families

- **Set-theoretic**: `∪` `∩` `\` `∆` `×`, `∈` `⊆` `ℬ(...)`, tuples `(H1×...×Hn)`.
- **Logical**: `¬` `&` `∨` `⇒` `⇔`, `∀` `∃`, comparisons `=` `≠` `<` …
- **Parameterized**: `[arg1∈H1, arg2∈H2] body` on functions/predicates.
- Advanced: declarative, imperative, recursive — see help subtopics under `help-rslang-expression-*`.

Always set `cstType` on `analyzeExpression` / upsert to match the constituent role (e.g. `term` for `D1`, `axiom` for `A1`).

## Diagnostic loop

1. After upsert or analyze, check `analysis.success`.
2. If false, read `analysis.diagnostics` or `listDiagnostics`.
3. Map `error.code` to human text via frontend `RSErrorCode` / `tx.rslang.error.*` (`rsconcept/frontend/src/domain/rslang/error.ts`, `labels.ts`).
4. Fix spans `[from, to)` in `definitionFormal`; re-upsert or re-analyze.

Do not guess types — use tool output (`type`, `valueClass`: `value` | `property`).

## Declaration order

Match frontend schema ordering when possible:

1. All `basic` and `constant`
2. Core / crucial constituents before dependents
3. Topological order: if `D2` uses `D1`, declare `D1` first
4. Derived terms immediately after their sources when expanding structure

## Checklist

- [ ] Session created; `sessionId` tracked for all calls
- [ ] Bases/constants added with empty formal definitions
- [ ] Dependents added only after referenced aliases exist
- [ ] `cstType` matches constituent role
- [ ] Diagnostics resolved before `commitStep` / export
- [ ] For deep syntax/semantics questions, consult help topics or [REFERENCE.md](REFERENCE.md)
