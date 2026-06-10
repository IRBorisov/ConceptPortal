# Примеры rstool

Короткие примеры для агентов. Полные скрипты и JSON-сессии — `../../examples/` ([README](../../examples/README.md)). Воркфлоу — [GUIDE.md](GUIDE.md).

## Минимальная сессия

```ts
import { CstType, RSToolAgent } from '@rsconcept/rstool';

const tool = new RSToolAgent();
const { sessionId } = tool.createSession();

tool.addOrUpdateConstituenta(sessionId, {
  draft: { id: 1, alias: 'X1', cstType: CstType.BASE, definitionFormal: '' }
});

tool.addOrUpdateConstituenta(sessionId, {
  draft: {
    id: 2,
    alias: 'S1',
    cstType: CstType.STRUCTURED,
    definitionFormal: 'ℬ(X1×X1)',
    convention: 'Элементы — пары (родитель, потомок); родитель, потомок ∈ X1.'
  }
});

const { state, diagnostics } = tool.addOrUpdateConstituenta(sessionId, {
  draft: { id: 3, alias: 'D1', cstType: CstType.TERM, definitionFormal: 'Pr1(S1)' }
});

console.log(state.analysis.success, diagnostics.length);
```

## Анализ перед upsert

Черновой анализ, когда синтаксис или `cstType` под вопросом.

```ts
const analysis = tool.analyzeExpression(sessionId, {
  expression: 'Pr1(S1)',
  cstType: CstType.TERM
});

if (!analysis.success) {
  console.log(analysis.diagnostics.map(({ code, from, to }) => ({ code, from, to })));
}
```

Исправь диапазон `from` / `to` из отчёта и повтори анализ. При необходимости пересмотри определение целиком или разбей на несколько конституент.

## Вычисление

```ts
tool.setConstituentaValue(sessionId, {
  target: 1,
  value: { 0: 'zero', 1: 'one' }
});

const scratch = tool.evaluateExpression(sessionId, {
  expression: '1+2',
  cstType: CstType.TERM
});

console.log(scratch.success, scratch.value); // true, 3
```

Для сохранённых определений задай значения `basic`, `constant` и `structure`, затем вызови `evaluateConstituenta` или `recalculateModel`.

## Семантический smoke-тест

Синтаксис верен, но смысл неочевиден — собери маленькую модель и проверь значение.

```ts
import { CstType, EvalStatus, RSToolAgent } from '@rsconcept/rstool';

const TUPLE_ID = -111;
const tool = new RSToolAgent();
const { sessionId } = tool.createSession();

tool.addOrUpdateConstituenta(sessionId, {
  draft: { id: 1, alias: 'X1', cstType: CstType.BASE, definitionFormal: '' }
});
tool.addOrUpdateConstituenta(sessionId, {
  draft: { id: 2, alias: 'S1', cstType: CstType.STRUCTURED, definitionFormal: 'ℬ(X1×X1)' }
});
tool.addOrUpdateConstituenta(sessionId, {
  draft: { id: 3, alias: 'D1', cstType: CstType.TERM, definitionFormal: 'Pr1(S1)' }
});

tool.setConstituentaValues(sessionId, {
  items: [
    { target: 1, value: { 0: 'ann', 1: 'bob', 2: 'cat' } },
    {
      target: 2,
      value: [
        [TUPLE_ID, 0, 1],
        [TUPLE_ID, 0, 2]
      ]
    }
  ]
});

const result = tool.evaluateConstituenta(sessionId, { constituentId: 3 });

if (!result.success || result.status !== EvalStatus.HAS_DATA || JSON.stringify(result.value) !== '[0]') {
  throw new Error(`Ожидалось Pr1(S1) = первая координата; получено ${JSON.stringify(result)}`);
}
```

Подробнее: `../../docs/MODEL-TESTING.md`.

## Клиент обёртки

Когда агент общается с отдельным процессом `rstool-wrapper`.

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

const diagnostics = await client.call('listDiagnostics', { sessionId });
console.log(diagnostics);

await client.close();
```

Ручной stdio — один JSON-запрос на строку:

```jsonl
{ "id": "1", "method": "createSession", "params": {} }
{ "id": "2", "method": "addOrUpdateConstituenta", "params": { "sessionId": "...", "input": { "draft": { "id": 1, "alias": "X1", "cstType": "basic", "definitionFormal": "" } } } }
```

## Экспорт / импорт

```ts
const payload = tool.exportSession(sessionId);
const restored = tool.importSession(payload);
```

Экспорт включает состояние сессии и значения модели.

Файлы для загрузки пользователем в существующий объект Portal:

```ts
const schemaJson = tool.exportPortalSchema(sessionId);
const modelJson = tool.exportPortalModel(sessionId);
```

`schemaJson` — на странице схемы, `modelJson` — на странице модели, через **Load from JSON**.
