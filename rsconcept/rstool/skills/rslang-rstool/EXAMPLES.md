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
```

## Wrapper client

```bash
npm run example:client
```

Equivalent flow in `examples/agent-client.ts`: ready → createSession → upsert → analyzeExpression → listDiagnostics.

## Build a small RSForm file

```bash
npm run example:build-sample
```

Writes `examples/sample-rsform-session.json` with `X1`, `C1`, `D1` (`X1×X1`), `A1` (`1=1`).

Larger domain example: `examples/build-kinship-rsform.ts` → `examples/kinship-rsform-session.json`.

## Manual stdio (PowerShell)

Start wrapper in one terminal:

```powershell
cd D:\DEV\WORK\Portal\rsconcept\rstool
npm run wrapper
```

Paste lines (after ready line appears):

```json
{"id":"1","method":"createSession","params":{}}
```

Use returned `sessionId` in subsequent lines.

## Common mistakes

| Mistake | Symptom |
|---------|---------|
| `definitionFormal: 'Z'` on `X1` (`basic`) | `0x8862` formalDefinitionNotAllowed |
| `D1` uses `D2` before `D2` exists | globalNotTyped / undeclared global |
| `analyzeExpression` with wrong `cstType` | Role-specific semantic errors |
| Non-empty formal on `C1` (`constant`) | Same as basic — definition not allowed |

## Fixing a syntax error

1. `analyzeExpression` with the broken fragment and correct `cstType`.
2. Read first diagnostic `{ from, to, code }`.
3. Edit substring of `definitionFormal` at those offsets.
4. `addOrUpdateConstituenta` again with the same `id` / `alias`.
