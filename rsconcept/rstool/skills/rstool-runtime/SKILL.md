---
name: rstool-runtime
description: >-
  Как вызывать rstool: библиотека RSToolAgent, stdio-обёртка, MCP. Быстрый
  контракт, запуск скриптов вне пакета, сохранение сессий, кодировки Windows,
  словарь «API → текст для пользователя».
---

# rstool · запуск и контракт

Пути — от `<rstool>`. Полный контракт — [REFERENCE.md](REFERENCE.md); сниппеты и антипаттерны — [EXAMPLES.md](EXAMPLES.md).

Создание сессии rstool и экспорт JSON не создают КС на Portal. Для создания на портале, задания `location` и загрузки содержимого используй `skills/rs-portal/SKILL.md`. Папка библиотеки определяется путём самой схемы, отдельное создание папки не нужно. Возможности конкретного MCP проверяй по его каталогу, не переноси ограничения адаптера на весь REST API.

## Быстрый контракт

- Библиотека: `@rsconcept/rstool`, класс `RSToolAgent`. Анализатор — `@rsconcept/domain`.
- Правка схемы — только `applySchemaPatch({ items, mode?, commitMessage? })`. `id` и `cstType` выводятся из префикса имени (`X/C/S/D/F/P/A/T/N`); пачка упорядочивается сама. `mode: 'atomic'` (по умолчанию) откатывает всё при первой ошибке; `'best_effort'` применяет корректное — после него `failed` должен стать пустым.
- Черновик формулы — `analyzeExpression({ expression, cstType })` без сохранения.
- Диагностики — `listDiagnostics({ kind?, severity? })`; `analysisSuccess: true` в summary не означает их отсутствия.
- Состояние — `getSessionState()` (summary) или `getSessionState('full')`.
- Модель — `await setModelValues(...)`, `evaluate`, `recalculateModel`; `status` — число (`EvalStatus`). Для проверки смысла по брифу удобнее сценарии и `check-brief` (`docs/BRIEF.md`).
- Синтез (встраивание) — `synthesize({ sourceSessionId, substitutions })`; имена источника перенумеровываются (`aliasMapping` в ответе).
- Импорт / экспорт — `importData(payload, kind?)` (`auto` различает сессию и JSON Portal), `exportSession()`, `exportPortal({ kind: 'schema' })`.
- Настроенный HTTP MCP может добавить `portal_prepare_publication` и `portal_connection_status`. Подготовка не пишет в Portal; ключ и подтверждение пользователь вводит на отдельной HTTPS-странице с независимым пользовательским токеном. Обычный токен агента эту страницу настроек не открывает. Секреты не передавать в чат/аргументы инструмента. Порядок и ограничения: `../rstool-mcp/PORTAL.md` относительно корня пакета, REST-протокол — `docs/PORTAL-PUBLISH.md`.
- Stdio (`npx rstool-wrapper`) и MCP (`@rsconcept/rstool-mcp`, имена в `snake_case`): **плоские** `params` — поля метода и `sessionId` на одном уровне.
- При прямом вызове библиотеки дожидайся каждой записи в одну сессию. `setModelValues` работает с копией; при пересекающейся правке отклоняет сохранение с `Session changed during model update`, сохраняя новую правку. Перечитай состояние и реши, нужен ли повтор. Stdio и MCP по умолчанию ставят вызовы в очередь.

## Запуск скрипта вне пакета

Разовые скрипты, сессии, бриф и экспорт — в папке задачи, **не** в `<rstool>`.

**В workspace Portal** (после `pnpm install` и сборки `@rsconcept/domain`):

```bash
pnpm --filter @rsconcept/rstool exec tsx <abs>/task/build.mts
```

- Импорт по абсолютному `file://` URL: `import { RSToolAgent } from 'file:///<workspace>/rsconcept/rstool/src/index.ts'`. Обычный `'@rsconcept/rstool'` из файла вне пакета не резолвится; на Windows путь без `file://` падает (`ERR_UNSUPPORTED_ESM_URL_SCHEME`).
- Расширение **`.mts`**: `.ts` вне пакета считается CommonJS, а `@rsconcept/*` — только ESM.
- Helpers domain — тем же способом: `file:///…/rsconcept/domain/src/index.ts` (`TUPLE_ID`, `EvalStatus`), `…/domain/src/rslang/labels.ts` (`labelType`).

**В npm-проекте:** `npx tsx task/build.mts` с обычным `import { RSToolAgent } from '@rsconcept/rstool'`.

Альтернатива без резолвинга — stdio из собранного `dist`: `new RSToolWrapperClient({ command: 'node', args: ['<abs>/rsconcept/rstool/dist/wrapper/stdio-wrapper.js'] })`.

```ts
import { readFileSync, writeFileSync } from 'node:fs';
import { RSToolAgent } from 'file:///<workspace>/rsconcept/rstool/src/index.ts';

const tool = new RSToolAgent();
tool.importData(readFileSync('<abs>/task/session.json', 'utf-8'));
console.log(tool.listDiagnostics());
writeFileSync('<abs>/task/session.json', tool.exportSession(), 'utf-8');
```

**Проверка брифа** — `skills/scripts/check-brief.ts` запускается из пакета, не копируется: `pnpm --filter @rsconcept/rstool exec tsx skills/scripts/check-brief.ts --session <abs> --brief <abs>` (npm: `npx tsx node_modules/@rsconcept/rstool/skills/scripts/check-brief.ts …`).

## Сохранение сессий

Сессии живут в памяти процесса. Между запусками скрипта сохраняй `exportSession()` в файл и загружай `importData`. `new RSToolAgent({ persistenceDir })` (stdio / MCP: `RSTOOL_PERSISTENCE_DIR`) сохраняет сессии автоматически.

Изменения сессии становятся видимыми после успешного сохранения; ошибка записи оставляет прежнее состояние. Файл сессии и `_current.json` заменяются атомарно по отдельности. Это не общая транзакция двух файлов и не блокировка между процессами: один живой `RSToolAgent` на каталог. Подробности — `REFERENCE.md`, «Целостность сессий».

## Windows и кодировки

- Консоль часто в cp1251: символы ЯРЭ в выводе ломаются. Пиши результаты в файл UTF-8; в PowerShell — `-Encoding utf8`.
- JSON — UTF-8 без экранирования Unicode (`ensure_ascii=False` в Python). Логи в `print` — ASCII.
- В PowerShell вызывай `curl.exe`, а не alias `curl`.

## Язык ответа

С пользователем — термины предметной области, не имена API. Идентификаторы уместны только в коде, патчах и JSON.

| В API                             | В тексте ответа                     |
| :-------------------------------- | :---------------------------------- |
| `alias`                           | имя конституенты                    |
| `cstType`                         | тип конституенты                    |
| `definitionFormal`                | формальное определение (формула)    |
| `term`                            | термин                              |
| `definitionText`                  | текстовое определение               |
| `convention`                      | конвенция                           |
| `applySchemaPatch`                | правка схемы                        |
| `synthesize`                      | встраивание / синтез схем           |
| `analyzeExpression`               | проверка / анализ выражения         |
| `listDiagnostics`, `diagnostics`  | диагностики                         |
| `setModelValues`, `getModelState` | интерпретация, значения модели      |
| `evaluate`, `recalculateModel`    | вычисление, пересчёт модели         |
| `commitStep`, `commitMessage`     | фиксация шага (ревизия)             |
| `exportSession` / `exportPortal`  | экспорт сессии / экспорт для Portal |
| `importData`                      | импорт данных                       |
| session, `sessionId`              | сессия                              |
| brief, `check-brief`              | бриф, проверка по брифу             |

Имена конституент (`X1`, `D3`) и формулы — часть схемы, приводи как есть, лучше с термином. Термины КС — `docs/DOMAIN.md` «Термины: не путать».

## Не делай

- Не клади разовые скрипты и снимки в `<rstool>` и `examples/`.
- Не передавай JSON `/details` Portal с `kind: 'session'`.
- Не повторяй вызов без изменения ввода.
- Не задавай значения производным понятиям — только `X#`, `C#`, `S#`.

## Сессии и ошибки

Контракт 4.0: чтение, анализ, экспорт и вычисление не создают сессию. При `NO_CURRENT_SESSION` вызови `ensure_session` / `ensureSession` или `create_session` / `createSession`. `apply_schema_patch` может создать её из `initial`; импорт тоже создаёт сессию. `SESSION_NOT_FOUND` означает неизвестный явный ID.

Для X/C передавай объект меток `{"0":"one","1":"two"}`, не массив. В значениях модели множество кодируется массивом `[0,1]`, кортеж — `[-111,0,1]`, множество кортежей — `[[-111,0,1]]`; логические значения — `0/1`. У `evaluate` выбери ровно один вариант: `constituentId` или `expression` вместе с `cstType`. Числовые ID бери из состояния сессии. `statusName` поясняет числовой `status`: `EMPTY` — пустое значение, `HAS_DATA` — непустое, `AXIOM_FALSE` — ложная аксиома. `success` описывает выполнение вычисления, а не истинность аксиомы или полноту интерпретаций. Перед выводом по пустому результату проверь `get_model_state`. При `schemaMissingConvention` добавь содержательную `convention` у соответствующего X/C/S.

В HTTP MCP сначала можно получить `get_session_storage_config`. При `SESSION_LIMIT_REACHED` просмотри `list_stored_sessions`: список не продлевает TTL. Переиспользуй сессию, дождись очистки или явно удали выбранную через `delete_stored_session` согласно политике пользователя/клиента. Передай свежие `sessionRef`, `revision` как `expectedRevision` и `confirm=true`; для текущей сессии дополнительно нужен `allowCurrent=true`. Не выбирай жертву автоматически и не обходи квоту новым workspace. После `SESSION_BUSY`/`SESSION_CHANGED` обнови список. После предупреждения, timeout или потери ответа сначала проверь конфиг/список, прежде чем удалять ещё что-либо. Ошибки миграции/хранилища передай оператору. Эти три инструмента доступны только в HTTP; подробности — [контракт хранения](https://github.com/IRBorisov/ConceptPortal/blob/main/rsconcept/rstool-mcp/HTTP.md#agent-self-service-for-account-storage).

При `COMPUTE_TIMEOUT`, `COMPUTE_RESOURCE_LIMIT` и ошибках размера не повторяй неизменённый ввод. Уточни ограничения через `get_session_storage_config`, сократи модель или вычисление. После потери ответа сначала проверь состояние. Полный список ошибок хоста см. в [REFERENCE.md](REFERENCE.md#ограничения-http-хоста).
