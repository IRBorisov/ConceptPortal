# ЯРЭ и rstool — примеры

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

## Терм-функция вместо множества пар

Правила — [CONCEPTUAL-SCHEMA.md](../../docs/CONCEPTUAL-SCHEMA.md), раздел «Терм-функция вместо множества пар».

### Было: граф и чтение через фильтр

```ts
tool.applySchemaPatch({
  items: [
    { alias: 'X1', convention: 'узлы' },
    { alias: 'S1', definitionFormal: 'ℬ(X1×X1)', convention: 'ориентированные рёбра' },
    {
      alias: 'D1',
      term: 'узел и его исходящие рёбра',
      definitionFormal: 'I{(ξ,σ) | ξ:∈X1; σ:=Pr2(Fi1[{ξ}](S1))}'
    },
    {
      alias: 'D2',
      term: 'узел и число исходящих рёбер',
      definitionFormal: 'I{(ξ,n) | α:∈D1; ξ:=pr1(α); n:=card(pr2(α))}'
    },
    {
      alias: 'A1',
      term: 'функциональность графика D1',
      definitionFormal: '∀d1,d2∈D1 (pr1(d1)=pr1(d2) ⇒ pr2(d1)=pr2(d2))'
    }
  ]
});
```

Потребитель «степени» вынужден тащить пары и аксиому однозначности.

### Стало: терм-функции и вызовы

```ts
tool.applySchemaPatch({
  items: [
    { alias: 'X1', convention: 'узлы' },
    { alias: 'S1', definitionFormal: 'ℬ(X1×X1)', convention: 'ориентированные рёбра' },
    {
      alias: 'F1',
      term: 'исходящие соседи',
      definitionFormal: '[ξ∈X1] Pr2(Fi1[{ξ}](S1))'
    },
    {
      alias: 'F2',
      term: 'исходящая степень',
      definitionFormal: '[ξ∈X1] card(F1[ξ])'
    },
    {
      alias: 'D3',
      term: 'стоки',
      definitionFormal: 'D{ξ∈X1 | F2[ξ]=0}'
    }
  ]
});
```

`A1` не нужна: однозначность уже в `F1`/`F2`. Множество пар не вводится, пока оно само не станет предметом утверждения.

## `X#`, `C#` и `Z`

Выбор основания — [BASE-SELECTION.md](../../docs/BASE-SELECTION.md).

```ts
// X# + отношение
tool.applySchemaPatch({
  items: [
    { alias: 'X1', convention: 'люди' },
    { alias: 'S1', definitionFormal: 'ℬ(X1×X1)' }
  ]
});

// Z×Z (шоколадный Ним) — без X# и C#
tool.applySchemaPatch({
  items: [{ alias: 'S1', definitionFormal: 'Z×Z', convention: 'ширина × длина' }]
});
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
const schemaIssues = tool.listDiagnostics({ kind: 'schema' });
const modelIssues = tool.listDiagnostics({ kind: 'model' });
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

const client = new RSToolWrapperClient({ command: 'npx', args: ['rstool-wrapper'] });
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
