# ЯРЭ и rstool — справочник

## Контракт rstool

- Пакет: `@rsconcept/rstool`
- Версия контракта: `3.0.0` (`CONTRACT_VERSION`)
- Основной класс: `RSToolAgent`
- Публичные импорты: `@rsconcept/rstool` и `@rsconcept/rstool/wrapper`

### Методы library API

| Метод                                          | Назначение                                                         |
| ---------------------------------------------- | ------------------------------------------------------------------ |
| `ensureSession(initial?)`                      | Вернуть текущую сессию или создать новую                           |
| `createSession(initial?)`                      | Новая in-memory сессия                                             |
| `getCurrentSession()`                          | Текущая активная сессия или `null`                                 |
| `setCurrentSession(sessionId)`                 | Сделать сессию текущей                                             |
| `applySchemaPatch(input, sessionId?)`          | Единственный путь правки схемы                                     |
| `getSessionState(detail?, sessionId?)`         | `summary` (default) или `full`                                     |
| `listDiagnostics(filters?, sessionId?)`        | Активные диагностики (`kind`: `expression` \| `schema` \| `model`) |
| `analyzeExpression(input, sessionId?)`         | Разбор без сохранения (`recordDiagnostics?`)                       |
| `commitStep(message?, sessionId?)`             | Ревизия                                                            |
| `exportSession(sessionId?)`                    | JSON сессии                                                        |
| `exportPortal({ kind, format? }, sessionId?)`  | Portal Load from JSON                                              |
| `importData(payload, kind?)`                   | Импорт сессии / Portal (`kind` см. ниже)                           |
| `setModelValues({ set?, clear? }, sessionId?)` | Значения модели (async — нужен `await`)                            |
| `getModelState(sessionId?)`                    | Состояние интерпретации                                            |
| `evaluate(input, sessionId?)`                  | Scratch или конституента                                           |
| `recalculateModel(sessionId?)`                 | Пересчёт                                                           |

### `applySchemaPatch`

```ts
tool.applySchemaPatch({
  initial: { title: 'Kinship' },
  commitMessage: 'initial schema',
  items: [{ alias: 'X1' }, { alias: 'S1', definitionFormal: 'ℬ(X1×X1)' }, { alias: 'D1', definitionFormal: 'Pr1(S1)' }]
});
```

- `items` упорядочиваются автоматически: поставщики раньше потребителей.
- `id` и `cstType` можно опускать — выводятся из префикса `alias` (`X/C/S/D/F/P/A/T/N`).
- `mode`: `'atomic'` (default; откат всей пачки при первой ошибке) или `'best_effort'` (применяются корректные элементы).
- `commitMessage` фиксирует ревизию после успешного patch.

### `importData(payload, kind?)`

`kind`: `'auto'` (default; определяет формат по содержимому), `'session'`, `'portal-details'` (ответ `GET /api/rsforms/:id/details`), `'portal-schema'` (Portal Load from JSON). После импорта новая сессия становится текущей.

### Протокол stdio

Плоские `params` (без `input`). Опционально: переменная окружения `RSTOOL_PERSISTENCE_DIR` — каталог для сохранения сессий между перезапусками обёртки (в library API — `new RSToolAgent({ persistenceDir })`).

Служебные методы:

- `ping` — liveness и `contractVersion`.
- `methods` — список доступных stdio-методов.

```json
{"id":"2","method":"applySchemaPatch","params":{"items":[{"alias":"X1"}]}}
{"id":"7","method":"setModelValues","params":{"set":[{"target":1,"value":{"0":"a"}}]}}
{"id":"8","method":"evaluate","params":{"constituentId":3}}
{"id":"9","method":"exportPortal","params":{"kind":"schema"}}
{"id":"10","method":"importData","params":{"payload":"..."}}
```

## Документация

Воркфлоу: `GUIDE.md`. Примеры: `EXAMPLES.md`. Язык: `docs/*.md`.
