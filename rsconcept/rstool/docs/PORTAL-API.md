# Portal REST API

Справка для чтения существующих КС, ОСС и RSModel из Portal и переноса КС в `rstool`.
`rstool` сам не ходит в REST API: он работает с in-memory сессиями.
Агент получает JSON Portal отдельно, затем переносит конституенты через контракт `rstool`.

## Хосты

- UI: `https://portal.acconcept.ru/`
- REST API: `https://api.portal.acconcept.ru/`

## Пути

- `/rsforms/:id` в UI → `GET /api/rsforms/:id` для метаданных.
- Полная КС → `GET /api/rsforms/:id/details`.
- Версия КС → `GET /api/library/:id/versions/:version`.
- ОСС → `GET /api/oss/:id` и соседние routes viewset.
- Модель → `GET /api/models/:id`.
- OpenAPI JSON → `GET https://api.portal.acconcept.ru/schema`.

Для UI-ссылки `https://portal.acconcept.ru/rsforms/856` агент должен ходить на:

```text
GET https://api.portal.acconcept.ru/api/rsforms/856
GET https://api.portal.acconcept.ru/api/rsforms/856/details
```

Не переноси UI query/hash вроде `?tab=editor`.

## Доступ

- `access_policy: "public"` читается без авторизации.
- Приватная схема или модель вернёт `403` и не предназначена для агентов.
- Если нужны только `title`, `alias`, `description`, `owner`, `access_policy`, не запрашивай `/details`.

## Формат `GET /api/rsforms/:id/details`

Ответ содержит метаданные объекта библиотеки и массив `items[]` с конституентами.
Для анализа КС обычно нужны только корневые `title`, `alias`, `description` и поля каждой конституенты.

| Portal JSON           | `rstool`                 | Примечание                                            |
| --------------------- | ------------------------ | ----------------------------------------------------- |
| `id`                  | `draft.id`               | Стабильный id внутри сессии                           |
| `alias`               | `draft.alias`            | `X1`, `C1`, `S1`, `D1`, `F1`, `P1`, `A1`, `T1`        |
| `cst_type`            | `draft.cstType`          | Значения совпадают с `CstType`                        |
| `definition_formal`   | `draft.definitionFormal` | Пустая строка допустима только для `basic`/`constant` |
| `term_raw`            | `draft.term`             | Для редактирования сохраняй raw, не resolved          |
| `definition_raw`      | `draft.definitionText`   | Для редактирования сохраняй raw, не resolved          |
| `convention`          | `draft.convention`       | Соглашение, не формальная проверка                    |
| `term_resolved`       | не переносить            | Только отображение после resolver                     |
| `definition_resolved` | не переносить            | Только отображение после resolver                     |
| `typification_manual` | обычно не переносить     | Переопределение типизации                             |
| `term_forms`          | обычно не переносить     | Словоформы термина                                    |
| `crucial`             | обычно не переносить     | UI/Portal-флаг                                        |
| `value_is_property`   | обычно не переносить     | Переопределение класса интерпретируемости             |

`inheritance`, `attribution`, `oss`, `models`, `versions`, `editors` полезны для контекста Portal, но не нужны для базовой проверки RSLang в `rstool`.

## Как перенести КС в rstool

1. Получи `GET /api/rsforms/:id/details`.
2. Создай `createSession({ title, alias, comment: description })`.
3. Иди по `items[]` в порядке ответа API.
4. Для каждого элемента вызови `addOrUpdateConstituenta(sessionId, { draft })`.
5. Проверь `listDiagnostics(sessionId)`.
6. Работай локально: анализ, правки, вычисления, маленькая КМ.
7. Для сохранения рабочей сессии используй `exportSession`.
8. Для загрузки схемы обратно в Portal используй `exportPortalSchema`.

Portal JSON из `/details` **не является** форматом `exportSession` и не передаётся
в `importSession` напрямую. Его нужно перенести через `addOrUpdateConstituenta`
или через отдельный адаптер, если он появится в контракте.

Минимальный маппинг:

```ts
const session = tool.createSession({
  title: portal.title,
  alias: portal.alias,
  comment: portal.description
});

for (const item of portal.items) {
  tool.addOrUpdateConstituenta(session.sessionId, {
    draft: {
      id: item.id,
      alias: item.alias,
      cstType: item.cst_type,
      definitionFormal: item.definition_formal ?? '',
      term: item.term_raw ?? '',
      definitionText: item.definition_raw ?? '',
      convention: item.convention ?? ''
    }
  });
}
```

## Практика для агентов

- Запрашивай API host, а не UI host: `https://api.portal.acconcept.ru/api/...`.
- Для больших схем используй увеличенный таймаут. В PowerShell вызывай `curl.exe`,
  а не alias `curl` (`Invoke-WebRequest`), если нужен CLI-синтаксис curl.
- Сначала бери метаданные, если нужно только название или доступность схемы.

## Не делай

- Не парси HTML SPA.
- Не запрашивай UI напрямую, используй преобразованные API запросы.
- Не передавай `/details` JSON в `importSession`.
- Не запрашивай `/details`, если нужны только метаданные.
