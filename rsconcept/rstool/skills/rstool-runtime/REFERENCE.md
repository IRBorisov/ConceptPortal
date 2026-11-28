# ЯРЭ и rstool — справочник

Контракт библиотеки, stdio, HTTP RPC и MCP для агентов. Запуск — [SKILL.md](SKILL.md), этапы работы — [маршрутизатор rstool](../rstool/SKILL.md), примеры — [EXAMPLES.md](EXAMPLES.md).

## Контракт rstool

- Пакет: `@rsconcept/rstool`
- Версия контракта: `4.1.0` (`CONTRACT_VERSION`). В 4.1 добавлен предпросмотр раскрытия структуры.
- Основной класс: `RSToolAgent`
- Публичные импорты: `@rsconcept/rstool` и `@rsconcept/rstool/wrapper`
- Опции: `new RSToolAgent({ persistenceDir? })` — каталог для сохранения сессий между перезапусками (stdio/MCP: `RSTOOL_PERSISTENCE_DIR`)

Почти все методы принимают optional `sessionId` вторым аргументом (в stdio/MCP — поле `sessionId` в плоских `params`). Без него используется текущая сессия. Только createSession, ensureSession, importData и applySchemaPatch могут создавать сессии. Остальные вызовы без текущей сессии возвращают NO_CURRENT_SESSION и не расходуют квоту; сначала вызови ensureSession или createSession.

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
| `previewStructure({ constituentId }, sessionId?)` | Раскрытие структуры без сохранения                              |
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

### Целостность сессий

- `setModelValues` выполняет всю правку на отдельной копии. До завершения чтение возвращает последнее сохранённое состояние. Ошибка вычисления не требует отката рабочей сессии.
- При конкурентной правке той же сессии сохранение копии отклоняется с `Session changed during model update; read the current state and retry`. Успешная конкурентная правка сохраняется. Библиотечный вызывающий код должен делать `await` перед следующей записью; разные сессии независимы.
- Синхронные правки КС, синтез, упорядочение, пересчёт, ревизии и диагностики фиксируются одним сохранением сессии. При сбое записи прежнее состояние остаётся в памяти и на диске.
- Stdio и MCP по умолчанию последовательно выполняют обращения к одному агенту. MCP-опция `serializeToolCalls: false` явно отключает очередь; проверка конфликта в библиотеке при этом остаётся.
- Файл сессии и `_current.json` каждый записываются через временный файл, `fsync` и замену `rename`. Это атомарность отдельного файла, а не транзакция двух файлов или гарантия сохранности при потере питания. Если новая сессия сохранена, а обновление указателя завершилось ошибкой, её полный файл может остаться; прежняя текущая сессия не меняется.
- Один активный `RSToolAgent` на каталог хранения. Координации между независимыми агентами и процессами нет. Служебное имя `_current`, Windows device names, разделители пути, `..`, управляющие символы и метасимволы Windows запрещены для сохраняемых идентификаторов.

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
| `previewStructure`  | `preview_structure`   |
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

Фильтры: `kind?: 'expression' | 'schema' | 'model'`, `constituentId?`, `severity?: 'error' | 'warning'`. В stdio / MCP те же поля передаются **плоско** в `params` (`{ "kind": "schema", "severity": "warning" }`); stdio дополнительно принимает устаревший вложенный `filters`.

`severity` отражает правило инструмента, а не вес для ревью: `schemaMissingConvention` / `schemaMissingTerm` приходят как `error`. Как ранжировать в отчёте — [rs-review](../rs-review/SKILL.md), «Ранжирование находок».

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

`type` — AST типизации; для чтения используй `labelType` из `@rsconcept/domain/rslang/labels` (`ℬ(X1×X1)`, `[X1] → ℬ(X1)`, `Logic`). `success: true` совместим с диагностикой `error` (например, `invalidPropertyUsage` при `valueClass: null`) — проверяй `diagnostics`.

## `previewStructure`

```ts
const preview = tool.previewStructure({ constituentId: 2 });
```

Числовой `constituentId` берётся из `getSessionState()` / `get_session_state`. В stdio и MCP поля `constituentId` и необязательное `sessionId` передаются на одном уровне. Если понятие связано со структурой другого понятия, открывается дерево исходного понятия, как в карточке Portal.

Успешный ответ содержит `success: true`, `nodes` и пустой массив `diagnostics`. Узел содержит `key`, путь типизации `path`, индекс родителя `parent` с нуля, текст типа `type`, формулу ЯРЭ `definition`, структурную ссылку `existing` и массив `definitionMatches`. У корня `parent` равен `null`, а `definition` содержит метку эффективной типизации, как в карточке.

- `existing` содержит `{ id, alias }` конституенты, которую Portal связывает с этим путём, или `null`. У корня это само понятие. Portal вычисляет связи при анализе схемы.
- `definitionMatches` содержит все совпадения по нормализованному формальному определению в виде `{ id, alias }`. Проверка равенств, выводимых из аксиом, остаётся задачей агента.
- При `success: false` массив `nodes` пуст. `diagnostics` содержит причину с кодом `INVALID_CONSTITUENT_ID`, `CONSTITUENT_NOT_FOUND` или `UNDEFINED_TYPIFICATION`.

Предпросмотр сохраняет состояние схемы, модели и ревизий. Для записи выбранного производного понятия используется `applySchemaPatch`.

## `evaluate`

Ровно один вариант входа:

- конституента: `{ constituentId }`
- scratch: `{ expression, cstType }`

**Результат:** `{ success, value, status, iterations, cacheHits, diagnostics }`.

`status` — статус вычисления КМ, **числовой** код `EvalStatus` (`@rsconcept/domain`); смысл — [DOMAIN.md](../../docs/DOMAIN.md):

| Код | Имя             | Смысл                                   |
| --: | --------------- | --------------------------------------- |
| `1` | `NO_EVAL`       | не вычисляется (`X#`, `C#`, `F#`, `P#`) |
| `2` | `NOT_PROCESSED` | вычисление не запускалось               |
| `3` | `INVALID_DATA`  | неверная интерпретация                  |
| `4` | `EVAL_FAIL`     | ошибка вычисления                       |
| `5` | `AXIOM_FALSE`   | аксиома ложна                           |
| `6` | `EMPTY`         | результат пуст                          |
| `7` | `HAS_DATA`      | вычислено, непусто                      |

Scratch-выражение: `cstType` задаёт ожидаемую ступень (`term` — множество / число, `axiom` — логическое). Ссылки на `D#` / `A#` / `T#` внутри scratch допустимы — их значения (и зависимости через `F#` / `P#`) вычисляются перед оценкой.

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
- Значения `S#` приводятся к канонической форме (сортировка, без дубликатов) — порядок элементов во входе не важен; в `getModelState` хранится уже нормализованное значение.
- `getModelState()` → `{ items: [{ id, type, value }] }`.
- `recalculateModel()` → `{ items: [{ id, alias, value, status }] }` (`status` — числовой `EvalStatus`, таблица выше).

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

`kind`: `'auto'` (default), `'session'`, `'portal-details'` (JSON of `GET /api/agents/rsforms/:id/details` or public `GET /api/rsforms/:id/details`), `'portal-schema'` (Portal Load from JSON). После импорта новая сессия становится текущей. Возвращает `SessionHandle`.

Portal JSON из `/details` **не** является `exportSession` — не передавай его с `kind: 'session'`.

### `exportSession()`

JSON-строка сессии для последующего `importData(..., 'session')`.

### `exportPortal({ kind, format? })`

- `kind`: `'schema'` | `'model'`
- `format?`: `'json'` (default, строка) | `'object'`
- Для загрузки в Portal UI: обычно `exportPortal({ kind: 'schema' })`.
- Поля `crucial`, `term_forms`, `typification_manual`, `value_is_property` и `attribution` берутся из сессии. Импорт Portal JSON их сохраняет; `applySchemaPatch` без этих полей их не стирает.

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
{"id":"12","method":"listDiagnostics","params":{"kind":"expression","severity":"error"}}
```

## Help map: ошибка → документ

| Ситуация                                           | Куда                                                    |
| -------------------------------------------------- | ------------------------------------------------------- |
| Код / `name` диагностики                           | [DIAGNOSTICS.md](../../docs/DIAGNOSTICS.md)             |
| Синтаксис операторов, `D{}`/`I{}`/`R{}`, `F#`/`P#` | [SYNTAX.md](../../docs/SYNTAX.md)                       |
| Объяснить формулу / конструкцию человеку           | [CONSTRUCTIONS.md](../../docs/CONSTRUCTIONS.md)         |
| Ступени, `AnalysisResult.type`                     | [TYPIFICATION.md](../../docs/TYPIFICATION.md)           |
| `X#` vs `C#` vs `Z`, переносимость                 | [BASE-SELECTION.md](../../docs/BASE-SELECTION.md)       |
| Проектирование, `F#` vs пары, ревью                | [CONCEPTUAL-SCHEMA.md](../../docs/CONCEPTUAL-SCHEMA.md) |
| Поля и валидация конституенты                      | [CONSTITUENTA.md](../../docs/CONSTITUENTA.md)           |
| Формы значений КМ, тесты                           | [MODEL-TESTING.md](../../docs/MODEL-TESTING.md)         |
| Ссылка Portal, REST, curl                          | [PORTAL-READ.md](../../docs/PORTAL-READ.md)             |
| Термины, статусы, «не путать»                      | [DOMAIN.md](../../docs/DOMAIN.md)                       |
| Бриф, сценарии, `check-brief`                      | [BRIEF.md](../../docs/BRIEF.md)                         |
| Метод: этапы и гейты                               | [METHOD.md](../../docs/METHOD.md)                       |
| Этапы работы, маршрут                              | [../rstool/SKILL.md](../rstool/SKILL.md)                |
| Сниппеты и антипаттерны                            | [EXAMPLES.md](EXAMPLES.md)                              |

Исходники кодов ошибок ЯРЭ: `@rsconcept/domain` (`RSErrorCode`, `error.ts`). Не дублируй грамматику в skill — правь domain и при необходимости этот help map.

## HTTP API rstool

`GET /v1/contract` доступен без токена. Он возвращает `apiVersion: 1`, версию базового контракта, JSON Schema оболочек и соответствие имён операций stdio и MCP. Параметры отдельных операций описаны выше в этом справочнике.

Для `POST /v1/rpc` отправь `Content-Type: application/json` и `Authorization: Bearer …`. Оболочка содержит `id`, `method` и плоские `params`. Состояние выбирает поле `state`:

| Режим | Поле | Срок жизни |
| --- | --- | --- |
| Разовое выполнение | Без `state` или `state.session` с экспортом `exportSession()` в виде строки или объекта | Новый агент на каждый запрос. Для продолжения передавай экспорт из предыдущего ответа |
| Сессия проекта | `state.sessionId` | Только на программном хосте с настроенным `resolveProjectAgent`. Хост разрешает ID в области подтверждённых пользователя и проекта |

Идентификатор серверной сессии передавай в `state.sessionId`. `params.sessionId` допустим только у `setCurrentSession`, который не работает с `state.sessionId`. `returnSession: true` добавляет в успешный ответ строку `session`, если у операции есть доступная сессия. CLI поддерживает разовые запросы. Сохранённые сессии MCP обслуживает собственный хост.

Ошибки диспетчера, в том числе `NO_CURRENT_SESSION` и `METHOD_NOT_FOUND`, приходят с HTTP `200` и `ok: false`. Проверяй `ok` и `error.code`. Ошибки аутентификации, запроса и лимитов имеют отдельный HTTP-статус. По умолчанию предел запроса — 1 МиБ, ответа RPC — 4 МиБ, ожидание проверки токена — 5 секунд (`503 AUTH_TIMEOUT`). При `413 RESPONSE_TOO_LARGE` сервер возвращает `id: null`, если исходный ID выходит за лимит. Операция могла уже изменить сохранённую сессию. Сначала прочитай состояние, затем реши, нужен ли повтор. [Настройка CLI и пример Python](../../README.md#start-the-rstool-rpc-service)

## Portal через HTTP MCP

Инструменты Portal появляются в каталоге Streamable HTTP MCP при включённой интеграции. Проверь `list_methods` и применяй маршрут из [rs-portal](../rs-portal/SKILL.md). Настройку проекта, OAuth и совместимость версий описывает [документация MCP-хоста](https://github.com/IRBorisov/ConceptPortal/blob/main/rsconcept/rstool-mcp/PORTAL.md).

### Trusted storage lifecycle hooks

`RSToolAgentOptions.sessionLifecycle` optionally supplies synchronous `beforeCreate`, `created`, and `access` hooks plus an optional `onEviction` cache callback binding for a trusted host. Hooks cover persisted creation/import and cached reads; a rejected access cannot revive expired data. `beforeCreate` runs before saving, `created` after saving the envelope, and `access` before cached/disk lookup. Hosts must preserve single-process storage ownership, enforce concurrency and avoid exposing secrets in errors. Ordinary library and stdio construction without these hooks keeps its existing behavior. Hosted MCP account quota, retention, migration and structured error codes are documented in [HTTP service](https://github.com/IRBorisov/ConceptPortal/blob/main/rsconcept/rstool-mcp/HTTP.md).

## Изменения контракта 4.0

- Сессию создают только `createSession`, `ensureSession`, `importData` и путь создания `applySchemaPatch`. Остальные методы без текущей сессии выбрасывают экспортируемый `RSToolError` с `code: 'NO_CURRENT_SESSION'`; неизвестный явный ID — `SESSION_NOT_FOUND`. Stdio и MCP сохраняют эти коды. Сначала вызови ensure/create или передай существующий ID.
- `evaluate` принимает ровно один вариант: `constituentId` либо `expression` + `cstType`. Смешивание или неполный вариант — `INVALID_EVALUATE_ARGUMENTS`. ID — число из состояния сессии, не имя вроде X1.
- Результаты evaluate и recalculateModel содержат `statusName: keyof typeof EvalStatus` рядом с числовым `status`. `success` не доказывает истинность аксиомы или полноту интерпретаций: проверь значение, статус и входные данные.
- X/C принимают объект меток `{"0":"one","1":"two"}`. Native value encoding: множество `[0,1]`, кортеж `[-111,0,1]`, множество кортежей `[[-111,0,1]]`, логические значения `0/1`. Маркер кортежа не является элементом предметной области.
- В MCP объектный результат доступен как `structuredContent` и как прежний JSON-текст. Ошибка содержит `structuredContent.error` с `code` и `message`; обычная ошибка исполнения — `TOOL_EXECUTION_FAILED`. Указания инструмента и диагностики остаются источником дальнейшего действия.

## Управление сохранёнными сессиями HTTP

`get_session_storage_config` возвращает действующие лимиты и использование аккаунта. `list_stored_sessions` показывает метаданные по рабочим пространствам текущего проекта или личной области без продления TTL. Удаление действует в той же области. Квота общая для аккаунта, включая личные и проектные рабочие пространства.

Учет сессий и своевременная очистка временных результатов — задача агента; подтверждение пользователя на удаление не запрашивай. При создании или импорте временной сессии сохрани workspace, ID и назначение в материалах задачи. Освобождай созданные для этой задачи сессии после проверенного полного экспорта, когда они больше не нужны для продолжения, синтеза или незавершенной публикации. Бриф и нужные внешние материалы сохрани отдельно. Если результат еще не сохранен или запись на Portal не завершена, сохрани рабочую сессию. Возраст, пустое имя и размер сами по себе не доказывают ненужность. Сессии других продолжающихся задач или неизвестного происхождения не удаляй.

Если нужно вернуть прежнюю текущую сессию, сделай это до заключительного экспорта: она должна быть доступна, а выбор не должен затрагивать продолжающуюся работу другого клиента. Экспортируй удаляемую сессию по явному `sessionId`. Если прежней нет, удалить свою текущую сессию можно с `allowCurrent=true`; новая пустая сессия для замены не нужна.

Свяжи экспорт с удаляемой редакцией. По свежему списку сопоставь точный workspace, `sessionId` и `sessionRef`; у цели должно быть `callerWorkspace=true`. Один ID может повторяться в разных workspace после импорта. От экспорта до удаления удерживай одно непрерывное эксклюзивное HTTP-подключение с тем же `Mcp-Session-Id` именно к workspace цели: один управляющий клиент, без параллельных или ожидающих модельных вызовов. После завершения `export_session` получи `revision` из списка, сохрани ее рядом с экспортом и проверь экспорт локальным чтением или реимпортом. Непосредственно перед удалением перечитай список: `revision` должна совпасть с сохраненной. Между этими чтениями не вызывай инструменты доступа к модели и не меняй текущую сессию: даже чтение меняет ревизию активности. При расхождении заново установи, что работа закончена, и повтори экспорт/проверку. После разрыва подключения, reconnect, перезапуска или `404` начни привязку заново. Клиент, разрывающий подключение между вызовами, не обеспечивает эту привязку; для очистки нужен поддержанный непрерывный канал, а не предположение, что свежий список подтверждает старый экспорт.

Удаление любой сессии инвалидирует подготовку публикаций всего ее workspace. Перед очисткой проверь, что в нем нет нужной незавершенной публикации, включая публикации других продолжающихся задач. Проверка неатомарна для всего workspace: защита по ревизии относится к выбранной сессии, поэтому другая подготовка может завершиться позже этой проверки. После удаления прочитай `workspacePublicationsInvalidated` и предупреждения, заново подготовь еще нужные публикации; прежнее согласие на затронутую сводку не переиспользуй.

В `delete_stored_session` передай точный `sessionRef` и сохраненную проверенную `revision` в поле `expectedRevision`. Обязательный `confirm=true` — техническое намерение вызова: его выставляет агент без обращения к пользователю. Для выбранной текущей сессии также нужен `allowCurrent=true`. После удаления проверь список и квоту. При `SESSION_BUSY`/`SESSION_CHANGED` обнови список и заново установи, что сессия больше не нужна и экспорт соответствует ее состоянию. После предупреждения, timeout или потерянного ответа сначала проверь конфиг/список и не выбирай второе удаление для компенсации. Если безопасных кандидатов нет, сообщи о занятой квоте, сохраняя чужую работу. Эти инструменты отсутствуют в библиотеке/stdio; там заверши временный процесс после сохранения результата, а файлы пользовательского `persistenceDir` автоматически не удаляй. Удаление rstool-сессии не удаляет объекты Portal и не заменяет проверку публикации. Поля, ошибки и ограничения — в [контракте HTTP](https://github.com/IRBorisov/ConceptPortal/blob/main/rsconcept/rstool-mcp/HTTP.md#agent-self-service-for-account-storage).

## Ограничения HTTP-хоста

Обычные library/stdio не ограничивают размер модели и время вычисления. HTTP-хост сообщает действующие значения через `get_session_storage_config`: `limits.maxSessionBytes` и `computation`. Тяжёлые операции выполняются в отдельных процессах. При `COMPUTE_TIMEOUT`, `COMPUTE_CANCELLED`, `COMPUTE_RESOURCE_LIMIT`, `SESSION_TOO_LARGE` или `COMPUTE_RESULT_TOO_LARGE` результат не фиксируется. Не повторяй тот же ввод автоматически. При потере ответа сначала прочитай состояние, поскольку успешная фиксация могла предшествовать разрыву связи.

`COMPUTE_CAPACITY_REACHED` означает, что вычисление не стартовало. Перегруженный сервер не создаёт очередь вычислительных процессов. Старые модели сверх лимита видны в списке с `overSizeLimit=true`; читать их через инструменты нельзя. Для сохранения нужен административный экспорт; автоматически удалять такую модель без проверенной сохранности результата нельзя. Модель не обрезается автоматически. Подробности настройки описаны в `rstool-mcp/HTTP.md` исходного репозитория; локальное наличие этого файла не предполагается.
