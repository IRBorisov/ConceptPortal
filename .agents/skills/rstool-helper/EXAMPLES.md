# rstool — worked examples

Install first:

```bash
npm install @rsconcept/rstool
```

## In-process

```ts
import { CstType, RSToolAgent } from '@rsconcept/rstool';

const tool = new RSToolAgent();
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

```ts
import { CstType } from '@rsconcept/rstool';
import { RSToolWrapperClient } from '@rsconcept/rstool/wrapper';

const client = new RSToolWrapperClient();
await client.waitUntilReady();

const { sessionId } = await client.call<{ sessionId: string }>('createSession');
await client.call('addOrUpdateConstituenta', {
  sessionId,
  input: {
    draft: { id: 1, alias: 'X1', cstType: CstType.BASE, definitionFormal: '' }
  }
});

await client.call('addOrUpdateConstituenta', {
  sessionId,
  input: {
    draft: { id: 2, alias: 'D1', cstType: CstType.TERM, definitionFormal: 'X1×X1' }
  }
});

const diagnostics = await client.call('listDiagnostics', { sessionId });
console.log(diagnostics);

await client.close();
```

## Manual stdio

Start wrapper in one terminal:

```bash
npx rstool-wrapper
```

Paste one JSON request per line after the ready line appears:

```json
{ "id": "1", "method": "createSession", "params": {} }
```

Use the returned `sessionId` in subsequent lines:

```json
{ "id": "2", "method": "addOrUpdateConstituenta", "params": { "sessionId": "...", "input": { "draft": { "id": 1, "alias": "X1", "cstType": "basic", "definitionFormal": "" } } } }
{ "id": "3", "method": "addOrUpdateConstituenta", "params": { "sessionId": "...", "input": { "draft": { "id": 2, "alias": "D1", "cstType": "term", "definitionFormal": "X1×X1" } } } }
{ "id": "4", "method": "listDiagnostics", "params": { "sessionId": "..." } }
```

## Export a small RSForm session

```ts
import { CstType, RSToolAgent } from '@rsconcept/rstool';

const tool = new RSToolAgent();
const { sessionId } = tool.createSession();

tool.addOrUpdateConstituenta(sessionId, {
  draft: { id: 1, alias: 'X1', cstType: CstType.BASE, definitionFormal: '' }
});
tool.addOrUpdateConstituenta(sessionId, {
  draft: { id: 2, alias: 'C1', cstType: CstType.CONSTANT, definitionFormal: '' }
});
tool.addOrUpdateConstituenta(sessionId, {
  draft: { id: 3, alias: 'D1', cstType: CstType.TERM, definitionFormal: 'X1×X1' }
});
tool.addOrUpdateConstituenta(sessionId, {
  draft: { id: 4, alias: 'A1', cstType: CstType.AXIOM, definitionFormal: '1=1' }
});

const payload = tool.exportSession(sessionId);
console.log(payload);
```

## Model and evaluation

```ts
tool.setConstituentaValue(sessionId, {
  target: 1,
  value: { 0: 'zero', 1: 'one' }
});

const evaluated = tool.evaluateConstituenta(sessionId, {
  constituentId: 3
});
console.log(evaluated.success, evaluated.value);
```

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
