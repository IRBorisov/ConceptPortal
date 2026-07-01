# RSLang и rstool — примеры (контракт 2.0)

## Схема: batch patch

```ts
import { CstType, RSToolAgent } from '@rsconcept/rstool';

const tool = new RSToolAgent();

const result = tool.applySchemaPatch({
  initial: { title: 'Example' },
  commitMessage: 'initial',
  items: [{ alias: 'X1' }, { alias: 'S1', definitionFormal: 'ℬ(X1×X1)' }, { alias: 'D1', definitionFormal: 'Pr1(S1)' }]
});

console.log(result.summary.itemCount, result.success);
```

## Анализ без сохранения

```ts
const analysis = tool.analyzeExpression({
  expression: 'Pr1(S1)',
  cstType: CstType.TERM
});
```

## Состояние сессии

```ts
const summary = tool.getSessionState(); // compact
const full = tool.getSessionState('full'); // SessionState clone
const diags = tool.listDiagnostics();
```

## Модель и вычисление

```ts
await tool.setModelValues({
  set: [{ target: 1, value: { '0': 'alice', '1': 'bob' } }]
});

const evalResult = tool.evaluate({ constituentId: 2 });
const scratch = tool.evaluate({ expression: '1+2', cstType: CstType.TERM });
const recalc = tool.recalculateModel();
```

## Экспорт / импорт

```ts
const payload = tool.exportSession();
const restored = tool.importData(payload, 'session');

const schemaJson = tool.exportPortal({ kind: 'schema' });
const modelObj = tool.exportPortal({ kind: 'model', format: 'object' });

// Portal GET /api/rsforms/:id/details
const session = tool.importData(portalDetailsJsonString);
```

## Stdio (плоские params)

```json
{ "id": "1", "method": "applySchemaPatch", "params": { "items": [{ "alias": "X1" }] } }
{ "id": "2", "method": "setModelValues", "params": { "set": [{ "target": 1, "value": { "0": "a" } }] } }
{ "id": "3", "method": "evaluate", "params": { "constituentId": 2 } }
```

## Node-клиент

```ts
import { RSToolWrapperClient } from '@rsconcept/rstool/wrapper';

// Из checkout rstool: по умолчанию запускает `npm run wrapper` в текущем cwd.
// Для установленного пакета: new RSToolWrapperClient({ command: 'npx', args: ['rstool-wrapper'] }).
const client = new RSToolWrapperClient();
await client.waitUntilReady();

await client.call('applySchemaPatch', {
  items: [{ alias: 'X1' }, { alias: 'D1', definitionFormal: '1+2' }]
});

await client.call('setModelValues', {
  set: [{ target: 1, value: { 0: 'zero', 1: 'one' } }]
});

const evalResult = await client.call('evaluate', { constituentId: 2 });
await client.close();
```
