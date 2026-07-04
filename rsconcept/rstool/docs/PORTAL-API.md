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
- Список доступных объектов → `GET /api/library/active`.
- Поиск по тексту в схемах/ОСС/моделях → `GET /api/library/context-search?q=...`.
- Метаданные объектов по id → `GET /api/library/by-ids?ids=856,1203`.
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

**Для агентов через REST/curl** отдельного API-токена нет. Запросы без авторизации
видят только объекты с `access_policy: "public"` в общих разделах (`/S`, `/L`).
Это касается `context-search`, `by-ids`, `GET /api/rsforms/:id` и `/details`.

- Недоступная схема → `403` на прямой запрос; в `by-ids` такой id **пропускается**.
- Личные (`/U`) и проектные (`/P`) объекты через анонимный API **не читаются**, даже если
  пользователь дал UI-ссылку.
- Если нужны только `title`, `alias`, `description`, `owner`, `access_policy`, не запрашивай `/details`.

В браузере Portal использует Django session (`SessionAuthentication`). **Не предлагай
пользователю передавать session cookie агенту** — для curl/скриптов это нерабочий путь
(cookie привязан к браузеру, истекает, не предназначен для машинного доступа).

Если КС не публичная, варианты для агента:

1. Пользователь временно делает схему публичной (`access_policy: public`).
2. Пользователь экспортирует JSON (`GET /api/rsforms/:id/details` из своей сессии в UI
   или экспорт из Portal) и передаёт JSON в чат или файл — агент переносит в `rstool`.
3. Работа с личной библиотекой остаётся в UI Portal; агент помогает с публичными схемами
   и с JSON, который пользователь явно предоставил.

## Список и контекстный поиск в библиотеке

Чтобы найти схему по термину, формуле или названию, не перебирай все id подряд.
Бэкенд и UI используют контекстный поиск по вложенным текстовым полям.

### Полный список доступных объектов

```text
GET /api/library/active
```

Возвращает массив метаданных (`id`, `item_type`, `title`, `alias`, `description`, `location`,
`access_policy`, `visible`, …) для объектов, доступных текущему пользователю: публичные в `/S` и
`/L`, собственные и те, где пользователь редактор. Анониму — только публичные в общих разделах.

Для агентов обычно достаточно `context-search`; полный `active` нужен, если требуется обойти
все объекты без текстового фильтра.

### Контекстный поиск

```text
GET /api/library/context-search?q=<текст>&search_fields=<поля>&location=<путь>&subfolders=0|1&item_type=<тип>&admin=0|1
```

Ответ: `{ "ids": [856, 1203, ...] }` — id объектов библиотеки (КС, ОСС, RSModel), у которых
совпал хотя бы один из запрошенных текстовых фрагментов. Пустой или пробельный `q` → `ids: []`.
Регистр не важен; кириллица поддерживается.

| Параметр        | Обязателен | Описание                                                |
| --------------- | ---------- | ------------------------------------------------------- |
| `q`             | да\*       | Подстрока для поиска (\*пустой → пустой ответ)          |
| `search_fields` | нет        | Список полей через запятую; по умолчанию — все          |
| `location`      | нет        | Путь папки (`/S`, `/U/Проект`, …); см. ниже             |
| `subfolders`    | нет        | `1`/`true` — включать вложенные папки; по умолчанию `0` |
| `item_type`     | нет        | `rsform`, `oss` или `rsmodel` — ограничить тип объекта  |
| `admin`         | нет        | `1`/`true` — искать по всей библиотеке (только staff)   |

Допустимые значения `search_fields`:

| Поле                | Где ищет                                          |
| ------------------- | ------------------------------------------------- |
| `alias`             | Шифр объекта и конституент                        |
| `title`             | Название объекта                                  |
| `description`       | Описание объекта                                  |
| `term`              | Термин конституенты (`term_raw`, `term_resolved`) |
| `definition_formal` | Формальное определение, ручная типизация          |
| `definition_text`   | Текстовое определение конституенты                |
| `convention`        | Соглашение конституенты                           |
| `operation`         | Операции ОСС (alias, title, description)          |
| `block`             | Блоки ОСС (title, description)                    |

Для КС по термину или формуле обычно не указывай `search_fields` (все поля) или явно:
`search_fields=term,definition_formal,title`.

### Префиксы `location`

Путь хранится в поле `location` каждого объекта. Корневые префиксы:

| Префикс | Значение                                     |
| ------- | -------------------------------------------- |
| `/S`    | Общие (COMMON), публичные схемы для анонимов |
| `/L`    | Библиотека (LIBRARY), staff                  |
| `/U`    | Личное пространство пользователя             |
| `/P`    | Проекты                                      |

Вложенные папки: `/U/Мой проект/Подпапка`.

- без `subfolders` (по умолчанию) — только объекты с точным совпадением `location`;
- с `subfolders=1` — объекты в папке и во всех вложенных (`/U/Проект`, `/U/Проект/Подпапка`, …).

Параметр `item_type` сужает поиск до КС (`rsform`), ОСС (`oss`) или моделей (`rsmodel`).
Для поиска только концептуальных схем удобно: `item_type=rsform`.

### Метаданные по списку id

После `context-search` не нужно запрашивать всю библиотеку (`/active`) или каждый объект отдельно.

```text
GET /api/library/by-ids?ids=<id1>,<id2>,...
```

Ответ — массив метаданных в том же формате, что и `GET /api/library/active`:
`id`, `item_type`, `title`, `alias`, `description`, `location`, `access_policy`, `visible`, …

| Параметр | Описание                |
| -------- | ----------------------- |
| `ids`    | Список id через запятую |

Правила доступа те же, что у `context-search` и `active`: недоступные id **пропускаются**
(не ошибка, не `403` на весь запрос). Порядок элементов в ответе совпадает с порядком id
в запросе. Пустой `ids` → `[]`.

Для одной КС по-прежнему можно `GET /api/rsforms/:id`; для нескольких результатов поиска
удобнее `by-ids`, затем `GET /api/rsforms/:id/details` только для выбранных КС.

### Примеры curl

Публичный поиск по термину (без авторизации):

```bash
curl.exe -s "https://api.portal.acconcept.ru/api/library/context-search?q=множество"
```

Только в названиях и шифрах:

```bash
curl.exe -s "https://api.portal.acconcept.ru/api/library/context-search?q=логика&search_fields=title,alias"
```

Только КС в общем разделе и подпапках:

```bash
curl.exe -s "https://api.portal.acconcept.ru/api/library/context-search?q=множество&location=/S&subfolders=1&item_type=rsform"
```

Типичный пайплайн агента — найти id, затем метаданные и при необходимости полную КС:

```bash
# 1. Поиск
curl.exe -s "https://api.portal.acconcept.ru/api/library/context-search?q=множество"

# 2. Метаданные найденных объектов (подставь ids из шага 1)
curl.exe -s "https://api.portal.acconcept.ru/api/library/by-ids?ids=856,1203"

# 3. Полная КС для переноса в rstool (только для выбранной схемы)
curl.exe -s "https://api.portal.acconcept.ru/api/rsforms/856/details"
```

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
2. Вызови `importData(JSON.stringify(payload))` — auto определит `portal-details`; для Load from JSON — `importData(payload, 'portal-schema')`.
3. Проверь `listDiagnostics()` (после `importData` сессия уже текущая).
4. Работай локально: анализ, правки, вычисления, маленькая КМ.
5. Для сохранения рабочей сессии используй `exportSession`.
6. Для загрузки схемы обратно в Portal используй `exportPortal({ kind: 'schema' })`.

Альтернатива: `createSession` + `applySchemaPatch` с массивом `items`.

Portal JSON из `/details` **не является** форматом `exportSession`; используй `importData`, не передавай его как session export.

Минимальный импорт:

```ts
const session = tool.importData(JSON.stringify(portal));
tool.listDiagnostics();
```

Пакетный маппинг через `applySchemaPatch`:

```ts
const session = tool.createSession({
  title: portal.title,
  alias: portal.alias,
  comment: portal.description
});

tool.applySchemaPatch(
  {
    items: portal.items.map(item => ({
      id: item.id,
      alias: item.alias,
      cstType: item.cst_type,
      definitionFormal: item.definition_formal ?? '',
      term: item.term_raw ?? '',
      definitionText: item.definition_raw ?? '',
      convention: item.convention ?? ''
    }))
  },
  session.sessionId
);
```

## Практика для агентов

- Запрашивай API host, а не UI host: `https://api.portal.acconcept.ru/api/...`.
- Считай, что REST без авторизации = только **публичные** схемы в `/S` и `/L`.
- Для непубличной КС проси у пользователя JSON (`/details`) или публикацию схемы — не cookie.
- Для больших схем используй увеличенный таймаут. В PowerShell вызывай `curl.exe`,
  а не alias `curl` (`Invoke-WebRequest`), если нужен CLI-синтаксис curl.
- Сначала бери метаданные, если нужно только название или доступность схемы.

### Windows: кодировка в скриптах пайплайна

На Windows консоль по умолчанию часто **cp1251**; Python `print` падает с `UnicodeEncodeError`
на символах вне этой таблицы (стрелки `→`, математика в логах и т.п.). Если `print` стоит
**до** следующего шага пайплайна (например вызова `npx tsx`), скрипт оборвётся и артефакт
не обновится.

- **Запись JSON** — всегда UTF-8; для RSLang-символов в формулах не экранируй Unicode в JSON:

```python
path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding='utf-8')
```

- **Чтение** — `encoding='utf-8'`; для fetch API предпочитай `urllib` / `requests`, не
  `Out-File` без явной UTF-8 в PowerShell.
- **Логи в `print`** — ASCII (`->`, `...`) или только id/alias без математики; не полагайся
  на то, что консоль UTF-8.
- При необходимости Unicode в stdout: `PYTHONIOENCODING=utf-8` или `sys.stdout.reconfigure(encoding='utf-8')`
  (Python 3.7+), но для агентских скриптов проще держать вывод в ASCII.

## Не делай

- Не парси HTML SPA.
- Не запрашивай UI напрямую, используй преобразованные API запросы.
- Не предлагай авторизацию через session cookie или `sessionid` в curl.
- Не передавай `/details` JSON в `importData` с `kind: 'session'`.
- Не запрашивай `/details`, если нужны только метаданные.
