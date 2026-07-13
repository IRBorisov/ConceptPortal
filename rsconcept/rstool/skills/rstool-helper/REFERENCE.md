# ЯРЭ и rstool — справочник

Контракт library / stdio / MCP для агентов. Воркфлоу — [GUIDE.md](GUIDE.md). Примеры — [EXAMPLES.md](EXAMPLES.md). Язык — `docs/*.md`.

## Контракт rstool

- Пакет: `@rsconcept/rstool`
- Версия контракта: `3.3.0` (`CONTRACT_VERSION`)
- Основной класс: `RSToolAgent`
- Публичные импорты: `@rsconcept/rstool` и `@rsconcept/rstool/wrapper`
- Опции: `new RSToolAgent({ persistenceDir? })` — каталог для сохранения сессий между перезапусками (stdio/MCP: `RSTOOL_PERSISTENCE_DIR`)

Почти все методы принимают optional `sessionId` вторым аргументом (в stdio/MCP — поле `sessionId` в плоских `params`). Без него используется текущая сессия; при необходимости сессия создаётся лениво.

### Методы library API

| Метод                                          | Назначение                                                         |
| ---------------------------------------------- | ------------------------------------------------------------------ |
| `ensureSession(initial?)`                      | Вернуть текущую сессию или создать новую                           |
| `createSession(initial?)`                      | Новая in-memory сессия (становится текущей)                        |
| `getCurrentSession()`                          | Текущая активная сессия или `null`                                 |
| `setCurrentSession(sessionId)`                 | Сделать сессию текущей                                             |
| `applySchemaPatch(input, sessionId?)`          | Единственный путь правки схемы                                     |
| `getSessionState(detail?, sessionId?)`         | `summary` (default) или `full`                                     |
| `listDiagnostics(filters?, sessionId?)`        | Активные диагностики                                               |
| `analyzeExpression(input, sessionId?)`         | Разбор без сохранения                                              |
| `commitStep(message?, sessionId?)`             | Ревизия                                                            |
| `exportSession(sessionId?)`                    | JSON-строка сессии                                                 |
| `exportPortal({ kind, format? }, sessionId?)`  | Portal Load from JSON                                              |
| `importData(payload, kind?)`                   | Импорт сессии / Portal                                             |
| `setModelValues({ set?, clear? }, sessionId?)` | Значения модели (**async** — `await`)                              |
| `getModelState(sessionId?)`                    | Состояние интерпретации                                            |
| `evaluate(input, sessionId?)`                  | Scratch или конституента                                           |
| `recalculateModel(sessionId?)`                 | Пересчёт производных                                               |
| `restoreOrder(sessionId?)`                     | Упорядочить конституенты (топология + семантика)                   |
| `synthesize(input, sessionId?)`                | Синтез (встраивание): слить другую сессию + таблица отождествлений |

Служебные (stdio / MCP): `ping` / `pong`+`contractVersion`; `methods` / `list_methods`.

### Library ↔ stdio ↔ MCP

Stdio использует **camelCase** имён методов (как library). MCP (`@rsconcept/rstool-mcp`) — **snake_case**. Params везде **плоские** (без обёртки `input`).

| Library / stdio     | MCP tool              |
| ------------------- | --------------------- |
| `ping`              | `ping`                |
| `methods`           | `list_methods`        |
| `ensureSession`     | `ensure_session`      |
| `createSession`     | `create_session`      |
| `getCurrentSession` | `get_current_session` |
| `setCurrentSession` | `set_current_session` |
| `applySchemaPatch`  | `apply_schema_patch`  |
| `getSessionState`   | `get_session_state`   |
| `listDiagnostics`   | `list_diagnostics`    |
| `analyzeExpression` | `analyze_expression`  |
| `commitStep`        | `commit_step`         |
| `exportSession`     | `export_session`      |
| `exportPortal`      | `export_portal`       |
| `importData`        | `import_data`         |
| `setModelValues`    | `set_model_values`    |
| `getModelState`     | `get_model_state`     |
| `evaluate`          | `evaluate`            |
| `recalculateModel`  | `recalculate_model`   |
| `restoreOrder`      | `restore_order`       |
| `synthesize`        | `synthesize`          |

## `applySchemaPatch`

```ts
tool.applySchemaPatch({
  initial: { title: 'Kinship' },
  commitMessage: 'initial schema',
  items: [{ alias: 'X1' }, { alias: 'S1', definitionFormal: 'ℬ(X1×X1)' }, { alias: 'D1', definitionFormal: 'Pr1(S1)' }]
});
```

**Вход**

| Поле             | Смысл                                                                                                        |
| ---------------- | ------------------------------------------------------------------------------------------------------------ |
| `items`          | Массив патчей; у каждого обязателен `alias`                                                                  |
| `initial?`       | `alias` / `title` / `comment` — только если для patch создаётся новая сессия                                 |
| `mode?`          | `'atomic'` (default) — откат всей пачки при первой ошибке; `'best_effort'` — применяются корректные элементы |
| `commitMessage?` | После успешного patch фиксирует ревизию                                                                      |

**Патч элемента:** `alias` обязателен; `id`, `cstType`, `definitionFormal`, `term`, `definitionText`, `convention` опциональны. `id` и `cstType` выводятся из префикса `alias` (`X/C/S/D/F/P/A/T/N`). Поля мержатся с существующей конституентой.

**Поведение:** `items` упорядочиваются автоматически (поставщики раньше потребителей).

**Результат:** `{ success, applied, failed, diagnostics, session, summary, revision? }`.

- `applied` — успешно применённые конституенты со `analysis`.
- `failed` — `{ draft, diagnostics }[]` (при `best_effort` или атомарном отказе).
- `summary` — компактный обзор сессии (см. ниже).
- `revision` — если был `commitMessage`.

Для крупных импортов с частичными ошибками формул предпочитай `mode: 'best_effort'`, затем правь оставшееся по `failed` / `listDiagnostics`.

## `getSessionState`

- `getSessionState()` / `getSessionState('summary')` → `SessionSummary`:
  - `sessionId`, `contractVersion`, `alias`, `title`, `comment`
  - `itemCount`, `modelItemCount`, `diagnosticsCount`
  - `items[]`: `{ id, alias, cstType, analysisSuccess }`
  - `diagnostics[]` (активные)
  - `lastRevision?`
- `getSessionState('full')` → полный `SessionState` (все конституенты с формулами, модель, ревизии). Для обзора агенту обычно хватает `summary`.

## `listDiagnostics`

```ts
tool.listDiagnostics();
tool.listDiagnostics({ kind: 'expression' });
tool.listDiagnostics({ kind: 'schema', constituentId: 3, severity: 'error' });
```

Фильтры: `kind?: 'expression' | 'schema' | 'model'`, `constituentId?`, `severity?: 'error' | 'warning'`.

Элемент диагностики (агентский вид): `kind`, `code`, `name`, `severity`, `alias?`, `expression`, `from`, `to`, `params?`, `stack?` (цепочка вызовов при ошибке внутри `F#`/`P#`). Ключ для поиска исправления — `name` ([DIAGNOSTICS.md](../../docs/DIAGNOSTICS.md)).

## `analyzeExpression`

```ts
tool.analyzeExpression({
  expression: 'Pr1(S1)',
  cstType: CstType.TERM,
  recordDiagnostics: false // default
});
```

**Вход:** `expression`, `cstType` (обязательны); `recordDiagnostics?` — писать ли диагностики в сессию (default `false`).

**Результат:** `{ success, type, valueClass, diagnostics }`. Не сохраняет конституенту. Для черновика формулы — до `applySchemaPatch`.

## `evaluate`

Ровно один вариант входа:

- конституента: `{ constituentId }`
- scratch: `{ expression, cstType }`

**Результат:** `{ success, value, status, iterations, cacheHits, diagnostics }`.

`status` — статус вычисления КМ (`HAS_DATA`, `EMPTY`, `AXIOM_FALSE`, `EVAL_FAIL`, … — [DOMAIN.md](../../docs/DOMAIN.md)).

## `setModelValues` / `getModelState` / `recalculateModel`

```ts
await tool.setModelValues({
  set: [{ target: 1, value: { 0: 'a', 1: 'b' } }],
  clear: [3]
});
```

- `set[]`: `{ target, value, type? }` — `target` = id конституенты; `type` обычно не нужен.
- `clear[]`: id для сброса значений.
- Метод **async**. После изменения данных пересчитываются диагностики модели.
- `getModelState()` → `{ items: [{ id, type, value }] }`.
- `recalculateModel()` → `{ items: [{ id, alias, value, status }] }`.

Формы `value` для `X#` / `S#` — [MODEL-TESTING.md](../../docs/MODEL-TESTING.md).

## `restoreOrder`

Упорядочивает конституенты сессии одним проходом Kahn:

- формальные зависимости — жёстко (поставщик раньше зависимого);
- семантические дети — сразу после родителя, если уже готовы;
- иначе — стабильно относительно приоритета типов/ядра.

```ts
const { orderedAliases } = tool.restoreOrder();
// → { orderedIds: number[], orderedAliases: string[] }
```

## `synthesize`

**Синтез** в rstool сейчас — это **встраивание** схемы: вставка конституент из другой сессии в текущую с опциональной таблицей отождествлений (как «Встраивание схемы» в Portal UI).

```ts
const receiver = tool.createSession();
const source = tool.createSession();
tool.applySchemaPatch({ items: [{ alias: 'X1' }] }, source.sessionId);

tool.setCurrentSession(receiver.sessionId);
tool.synthesize({
  sourceSessionId: source.sessionId,
  // items?: ['X1'], // optional subset of source aliases
  substitutions: [{ original: 'X1', substitution: 'X1' }], // source → receiver
  commitMessage: 'merge'
});
```

**Вход**

| Поле              | Смысл                                                                                         |
| ----------------- | --------------------------------------------------------------------------------------------- |
| `sourceSessionId` | Сессия-источник (не должна совпадать с receiver)                                              |
| `items?`          | Алиасы конституент источника; пусто / omit — все                                              |
| `substitutions?`  | Таблица отождествлений по алиасам: в каждой строке один алиас источника и один алиас receiver |
| `commitMessage?`  | Ревизия после успеха                                                                          |

Алиасы импорта перенумеровываются при непустом receiver (`X1` → `X2`, …). Формулы и текстовые ссылки обновляются. Результат: `summary`, `idMap`, `aliasMapping`, `deletedIds`, `insertedIds`, и опционально `revision` (если был `commitMessage`). Также `success` / `failed` — как у `applySchemaPatch` (режим best-effort после встраивания).

## `importData` / `exportSession` / `exportPortal`

### `importData(payload, kind?)`

`kind`: `'auto'` (default), `'session'`, `'portal-details'` (`GET /api/rsforms/:id/details`), `'portal-schema'` (Portal Load from JSON). После импорта новая сессия становится текущей. Возвращает `SessionHandle`.

Portal JSON из `/details` **не** является `exportSession` — не передавай его с `kind: 'session'`.

### `exportSession()`

JSON-строка сессии для последующего `importData(..., 'session')`.

### `exportPortal({ kind, format? })`

- `kind`: `'schema'` | `'model'`
- `format?`: `'json'` (default, строка) | `'object'`
- Для загрузки в Portal UI: обычно `exportPortal({ kind: 'schema' })`.

## `commitStep` / сессии

- `commitStep(message?)` → `{ revisionId, at, message? }`.
- `ensureSession` / `createSession` принимают optional `initial`: `alias`, `title`, `comment` (и прочие поля `SessionState` в library).
- `SessionHandle`: `{ sessionId, contractVersion }`.

## Протокол stdio

Плоские `params`. Переменная окружения `RSTOOL_PERSISTENCE_DIR` — каталог персистентности.

```json
{"id":"2","method":"applySchemaPatch","params":{"items":[{"alias":"X1"}]}}
{"id":"7","method":"setModelValues","params":{"set":[{"target":1,"value":{"0":"a"}}]}}
{"id":"8","method":"evaluate","params":{"constituentId":3}}
{"id":"9","method":"exportPortal","params":{"kind":"schema"}}
{"id":"10","method":"importData","params":{"payload":"..."}}
{"id":"11","method":"getSessionState","params":{"detail":"summary"}}
```

## Help map: ошибка → документ

| Ситуация                                           | Куда                                                    |
| -------------------------------------------------- | ------------------------------------------------------- |
| Код / `name` диагностики                           | [DIAGNOSTICS.md](../../docs/DIAGNOSTICS.md)             |
| Синтаксис операторов, `D{}`/`I{}`/`R{}`, `F#`/`P#` | [SYNTAX.md](../../docs/SYNTAX.md)                       |
| Ступени, `AnalysisResult.type`                     | [TYPIFICATION.md](../../docs/TYPIFICATION.md)           |
| `X#` vs `C#` vs `Z`, переносимость                 | [BASE-SELECTION.md](../../docs/BASE-SELECTION.md)       |
| Проектирование, `F#` vs пары, ревью                | [CONCEPTUAL-SCHEMA.md](../../docs/CONCEPTUAL-SCHEMA.md) |
| Поля и валидация конституенты                      | [CONSTITUENTA.md](../../docs/CONSTITUENTA.md)           |
| Формы значений КМ, тесты                           | [MODEL-TESTING.md](../../docs/MODEL-TESTING.md)         |
| Ссылка Portal, REST, curl                          | [PORTAL-API.md](../../docs/PORTAL-API.md)               |
| Термины, статусы, «не путать»                      | [DOMAIN.md](../../docs/DOMAIN.md)                       |
| Воркфлоу агента                                    | [GUIDE.md](GUIDE.md)                                    |
| Сниппеты и антипаттерны                            | [EXAMPLES.md](EXAMPLES.md)                              |

Исходники кодов ошибок ЯРЭ: `@rsconcept/domain` (`RSErrorCode`, `error.ts`). Не дублируй грамматику в skill — правь domain и при необходимости этот help map.
