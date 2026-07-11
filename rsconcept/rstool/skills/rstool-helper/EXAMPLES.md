# ЯРЭ и rstool — примеры

Короткие фрагменты для агентов. Воркфлоу — [GUIDE.md](GUIDE.md). Контракт — [REFERENCE.md](REFERENCE.md).

## Индекс runnable `examples/`

Полные сценарии пакета:

| Тема                                                  | Паттерн                              | Смотри                                            |
| ----------------------------------------------------- | ------------------------------------ | ------------------------------------------------- |
| [`sample/`](../../examples/sample/)                   | Минимальная КС + КМ                  | `X1`, `C1`, `S1`, `D1`, `A1`                      |
| [`kinship/`](../../examples/kinship/)                 | Предметная схема, модель, CLI        | отношения на `X1`, правки интерпретации           |
| [`chocolate-nim/`](../../examples/chocolate-nim/)     | Математика на `Z` без `X#`           | [BASE-SELECTION.md](../../docs/BASE-SELECTION.md) |
| [`movd/`](../../examples/movd/)                       | Сложные `S#`, мультипроекции, `Fi`   | фильтры и проекции                                |
| [`expression-bank/`](../../examples/expression-bank/) | Шаблоны на радикалах `R#`            | [SYNTAX.md](../../docs/SYNTAX.md) «Радикалы»      |
| [`template-apply/`](../../examples/template-apply/)   | Подстановка `R#` → предметные домены | применение шаблонов                               |

Запуск и структура папок — [examples/README.md](../../examples/README.md).

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

### Когда пары уместны

Многозначная связь «документ — автор» — отношение; `F1` даёт **множество** авторов, а `D1` — отношение на документах:

```ts
tool.applySchemaPatch({
  items: [
    { alias: 'X1', convention: 'документы' },
    { alias: 'X2', convention: 'лица' },
    { alias: 'S1', definitionFormal: 'ℬ(X1×X2)', convention: 'авторство' },
    {
      alias: 'F1',
      term: 'авторы документа',
      definitionFormal: '[δ∈X1] Pr2(Fi1[{δ}](S1))'
    },
    {
      alias: 'D1',
      term: 'соавторские пары документов',
      definitionFormal: 'D{(a,b)∈X1×X1 | a≠b & F1[a]∩F1[b]≠∅}'
    }
  ]
});
```

## `D{}` / `I{}` / `R{}` — когда что

Синтаксис — [SYNTAX.md](../../docs/SYNTAX.md).

| Генератор                    | Когда                                      | Пример                                                                                     |
| ---------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `D{ξ∈A \| P(ξ)}`             | Отбор по условию без пошагового построения | `D{ξ∈X1 \| F2[ξ]=0}`                                                                       |
| `I{… \| блоки;}`             | Нужны промежуточные присваивания / сборка  | `I{(ξ,n) \| α:∈D1; ξ:=pr1(α); n:=card(pr2(α))}` — лучше заменить на `F#`, если это функция |
| `R{x:=base \| cond \| next}` | Рекурсивное наращивание                    | обход / итерация по правилу                                                                |

Антипаттерн: `I{(ξ,σ) \| ξ:∈A; σ:=E(ξ)}` для однозначного `E` → пиши `F ::= [ξ∈A] E(ξ)`.

## Конвенция: плохо / хорошо

У `X#` / `C#` / `S#` конвенция обязательна по смыслу (иначе `schemaMissingConvention`).

| Плохо                                         | Хорошо                                                            |
| --------------------------------------------- | ----------------------------------------------------------------- |
| `convention: 'X1'`                            | `convention: 'сотрудники организации'`                            |
| `convention: 'отношение'`                     | `convention: 'ориентированные рёбра: пара (начало, конец)'`       |
| пустая / копия термина без предметного смысла | кто элементы, как читать компоненты кортежа, какой порядок в паре |

Конвенция — предметный язык; она не заменяет формулу и не проверяется ЯРЭ.

## Типичные диагностики (было → стало)

Полный справочник — [DIAGNOSTICS.md](../../docs/DIAGNOSTICS.md). Исправляй диапазон `from`/`to` в формуле.

| `name`                                            | Было                                               | Стало                                                            |
| ------------------------------------------------- | -------------------------------------------------- | ---------------------------------------------------------------- |
| `typesNotEqual`                                   | смешение ступеней в `∪` / `=`                      | выровняй типы или введи промежуточный терм                       |
| `globalNotTyped`                                  | ссылка на ещё не введённый / нетипизированный `S1` | сначала поставщик в том же или предыдущем patch                  |
| `arithmeticNotSupported` / `orderingNotSupported` | `ξ+1` или `α<β` при `ξ∈X1`                         | `Z` или `C#` ([BASE-SELECTION.md](../../docs/BASE-SELECTION.md)) |
| `globalFuncParenCall`                             | `F1(ξ)`                                            | `F1[ξ]`                                                          |
| `globalFuncWithoutArgs`                           | голое `F1` в формуле                               | `F1[…]`                                                          |
| `radicalUsage`                                    | `R1` в теле формулы или как конституента           | `R#` только в `[…]` у `F#`/`P#`                                  |
| `schemaMissingConvention`                         | `X1` без конвенции                                 | добавь предметную конвенцию                                      |
| `schemaHomonym`                                   | одинаковый термин у разных конституент             | различай термины                                                 |
| `schemaDependencyCycle`                           | круг в определениях (`F3 → P1 → F3`)               | разорви цикл: убери взаимные ссылки                              |
| `localOutOfScopeParentheses`                      | `∀a∈S P(a) & Q(a)`                                 | `∀a∈S (P(a) & Q(a))`                                             |
| `invalidFilterSyntax`                             | кривой `Fi`                                        | `Fi1[{ξ}](S1)` / `Fi1,2[D1,D2](S1)`                              |

```ts
const analysis = tool.analyzeExpression({
  expression: 'F1(ξ)', // ошибка: скобки вызова
  cstType: CstType.TERM
});
// смотри analysis.diagnostics[].name, from, to
```

## Scratch-проверка одной формулы

Без полной схемы задачи — минимальный стенд:

```ts
const tool = new RSToolAgent();
tool.applySchemaPatch({
  items: [
    { alias: 'X1', convention: 'элементы' },
    { alias: 'S1', definitionFormal: 'ℬ(X1×X1)', convention: 'рёбра' }
  ]
});
const draft = tool.analyzeExpression({
  expression: '[ξ∈X1] Pr2(Fi1[{ξ}](S1))',
  cstType: CstType.FUNCTION
});
```

Семантику значения — отдельная маленькая КМ ([MODEL-TESTING.md](../../docs/MODEL-TESTING.md)).

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

## Экспорт / импорт и Portal round-trip

```ts
const payload = tool.exportSession();
const restored = tool.importData(payload, 'session');

const schemaJson = tool.exportPortal({ kind: 'schema' });
const modelObj = tool.exportPortal({ kind: 'model', format: 'object' });

// Portal GET /api/rsforms/:id/details → строка или объект
const session = tool.importData(portalDetailsJsonString); // kind auto
tool.listDiagnostics();
// правки…
const forPortal = tool.exportPortal({ kind: 'schema' });
```

Не передавай `/details` с `kind: 'session'`. REST и curl — [PORTAL-API.md](../../docs/PORTAL-API.md).

## Встраивание схемы (синтез)

```ts
const receiver = tool.createSession({ title: 'Base' });
tool.applySchemaPatch({ items: [{ alias: 'X1', term: 'человек' }] }, receiver.sessionId);

const source = tool.createSession({ title: 'Donor' });
tool.applySchemaPatch(
  {
    items: [
      { alias: 'X1', term: 'персона' },
      { alias: 'S1', definitionFormal: 'ℬ(X1)' }
    ]
  },
  source.sessionId
);

tool.setCurrentSession(receiver.sessionId);
tool.synthesize({
  sourceSessionId: source.sessionId,
  substitutions: [{ original: 'X1', substitution: 'X1' }] // source X1 → receiver X1
});
// receiver: X1 (человек), S1 = ℬ(X1)  — импортированный X1 отождествлён и удалён
```

## Образец текста ревью (не код)

После [воркфлоу ревью](GUIDE.md#ревью--оценка-готовой-кс) ответ может выглядеть так:

> **Вердикт:** схема покрывает роли и отношение подчинения; главный риск — вычисляемая «степень» задана графиком пар вместо терм-функции.
>
> **Диагностики:** 0 ошибок expression; 1 предупреждение schema (омоним термина).
>
> **Важно:** `D4` — множество пар «сотрудник — число подчинённых»; лучше `F#` с `card`.
> **Замечание:** у `S2` конвенция слишком общая («связь»).
>
> **Покрытие:** сущности и иерархия есть; нет высказывания о единственности руководителя.
>
> **Рекомендации:** (1) заменить `D4` на `F#`; (2) уточнить конвенцию `S2`; (3) при необходимости добавить `T#`. Правки не применял — жду подтверждения.

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
