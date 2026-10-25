---
name: rstool-runtime
description: >-
  Как вызывать rstool: библиотека RSToolAgent, stdio-обёртка, MCP. Быстрый
  контракт, запуск скриптов вне пакета, сохранение сессий, кодировки Windows,
  словарь «API → текст для пользователя».
---

# rstool · запуск и контракт

Пути — от `<rstool>`. Полный контракт — [REFERENCE.md](REFERENCE.md); сниппеты и антипаттерны — [EXAMPLES.md](EXAMPLES.md).

## Быстрый контракт

- Библиотека: `@rsconcept/rstool`, класс `RSToolAgent`. Анализатор — `@rsconcept/domain`.
- Правка схемы — только `applySchemaPatch({ items, mode?, commitMessage? })`. `id` и `cstType` выводятся из префикса имени (`X/C/S/D/F/P/A/T/N`); пачка упорядочивается сама. `mode: 'atomic'` (по умолчанию) откатывает всё при первой ошибке; `'best_effort'` применяет корректное — после него `failed` должен стать пустым.
- Черновик формулы — `analyzeExpression({ expression, cstType })` без сохранения.
- Диагностики — `listDiagnostics({ kind?, severity? })`; `analysisSuccess: true` в summary не означает их отсутствия.
- Состояние — `getSessionState()` (summary) или `getSessionState('full')`.
- Модель — `await setModelValues(...)`, `evaluate`, `recalculateModel`; `status` — число (`EvalStatus`). Для проверки смысла по брифу удобнее сценарии и `check-brief` (`docs/BRIEF.md`).
- Синтез (встраивание) — `synthesize({ sourceSessionId, substitutions })`; имена источника перенумеровываются (`aliasMapping` в ответе).
- Импорт / экспорт — `importData(payload, kind?)` (`auto` различает сессию и JSON Portal), `exportSession()`, `exportPortal({ kind: 'schema' })`.
- Stdio (`npx rstool-wrapper`) и MCP (`@rsconcept/rstool-mcp`, имена в `snake_case`): **плоские** `params` — поля метода и `sessionId` на одном уровне.

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
