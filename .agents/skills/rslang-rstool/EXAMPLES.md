# rstool — worked examples

Run all commands from `rsconcept/rstool`.

## In-process (Vitest-style)

```ts
import { CstType, RSFormAgentTool } from '../src';

const tool = new RSFormAgentTool();
const { sessionId } = tool.createSession();

// Base set — formal must be empty
tool.addOrUpdateConstituenta(sessionId, {
  draft: { id: 1, alias: 'X1', cstType: CstType.BASE, definitionFormal: '' }
});

// Term referencing base
const { state, diagnostics } = tool.addOrUpdateConstituenta(sessionId, {
  draft: { id: 2, alias: 'D1', cstType: CstType.TERM, definitionFormal: 'X1×X1' }
});

console.log(state.analysis.success, diagnostics.length);

// Scratch check
tool.analyzeExpression(sessionId, {
  expression: '(',
  cstType: CstType.TERM
}); // success: false, syntax diagnostics

// Set base binding and evaluate a term
tool.setConstituentaValue(sessionId, {
  target: 1,
  value: { 0: 'zero', 1: 'one' }
});
const evalResult = tool.evaluateExpression(sessionId, {
  expression: '1+2',
  cstType: CstType.TERM
});
console.log(evalResult.success, evalResult.value); // true, 3
```

## Wrapper client

```bash
npm run example:client
```

Equivalent flow in `examples/agent-client.ts`: ready → createSession → upsert → analyzeExpression → listDiagnostics.

## Build a small RSForm file

```bash
npm run example:build-schema
```

Writes `examples/sample-rsform-session.json` with `X1`, `C1`, `D1` (`X1×X1`), `A1` (`1=1`).

## Build a sample RSModel session

```bash
npm run example:build-rsmodel
```

Builds the same schema, sets base bindings on `X1` and `C1`, evaluates `D1` and `A1`, recalculates the model, and writes `examples/sample-rsmodel-session.json` (includes `state.model.items`).

Larger domain example: `examples/build-kinship-rsform.ts` → `examples/kinship-rsform-session.json` (includes term `D3` — внучатые племянники).

Kinship RSModel with non-empty `D3`: `npm run example:build-kinship-rsmodel` → `examples/kinship-rsmodel-session.json` (sets `X1`/`S1`, then `recalculateModel`).

Kinship X1 editing CLI (`examples/kinship/`):

```bash
npm run kinship:cli -- list
npm run kinship:cli -- add Кирилл
npm run kinship:cli -- remove Пётр
npm run kinship:cli -- rename Пётр Петр
npm run kinship:cli -- set Иван Мария Пётр Анна
npm run kinship:cli -- clear
npm run kinship:cli                    # interactive REPL
```

## Manual stdio (PowerShell)

Start wrapper in one terminal:

```powershell
cd D:\DEV\WORK\Portal\rsconcept\rstool
npm run wrapper
```

Paste lines (after ready line appears):

```json
{ "id": "1", "method": "createSession", "params": {} }
```

Use returned `sessionId` in subsequent lines.

## Common mistakes

| Mistake                                            | Symptom                                          |
| -------------------------------------------------- | ------------------------------------------------ |
| `definitionFormal: 'Z'` on `X1` (`basic`)          | `0x8862` definitionNotAllowed                    |
| `D1` uses `D2` before `D2` exists                  | globalNotTyped / undeclared global               |
| `analyzeExpression` with wrong `cstType`           | Role-specific semantic errors                    |
| Non-empty formal on `C1` (`constant`)              | Same as basic — definition not allowed           |
| `setConstituentaValue` on inferrable `D1` (`term`) | Error: inferrable and cannot be set directly     |
| Evaluating before base binding set                 | May fail or return empty depending on expression |

## Fixing a syntax error

1. `analyzeExpression` with the broken fragment and correct `cstType`.
2. Read first diagnostic `{ from, to, code }`.
3. Edit substring of `definitionFormal` at those offsets.
4. `addOrUpdateConstituenta` again with the same `id` / `alias`.
