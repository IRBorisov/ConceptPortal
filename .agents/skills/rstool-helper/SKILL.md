---
name: rstool-helper
description: >-
  ЯРЭ и концептуальные схемы через rstool: концептуализация, ревью/оценка КС,
  правки и диагностики формул, проверка на КМ (evaluate), выбор X#/C#/Z,
  импорт/экспорт Portal (/rsforms, /details). Читай GUIDE и docs из rsconcept/rstool.
---

# rstool-helper (Concept Portal workspace)

Тонкий входной skill для этого репозитория. Для работы **в дереве** не делай `npm install @rsconcept/rstool` — библиотека и документация лежат в `rsconcept/rstool/`.

Если skill скопирован в проект, где `@rsconcept/rstool` установлен из npm, используй пути пакета под `node_modules/@rsconcept/rstool/`. В workspace Portal всегда предпочитай in-repo файлы — они соответствуют локальному коду под правкой.

## Канонические файлы

Пути — от **корня workspace**.

| Что                                                 | Путь                                                 |
| :-------------------------------------------------- | :--------------------------------------------------- |
| **Начни здесь** — матрица задач, воркфлоу, чеклисты | `rsconcept/rstool/skills/rstool-helper/GUIDE.md`     |
| API, stdio, MCP, контракт                           | `rsconcept/rstool/skills/rstool-helper/REFERENCE.md` |
| Примеры, антипаттерны                               | `rsconcept/rstool/skills/rstool-helper/EXAMPLES.md`  |
| **`X#` / `C#` / `Z`** — выбор основания             | `rsconcept/rstool/docs/BASE-SELECTION.md`            |
| Язык и предметная область                           | `rsconcept/rstool/docs/*.md`                         |
| Правила агента для пакета                           | `rsconcept/rstool/AGENTS.md`                         |

## Задача → что читать

Не читай все `docs/` подряд. Открой **GUIDE.md** (раздел «Задача → чтение»), затем только нужные файлы:

| Задача                            | Минимум                                                                        |
| :-------------------------------- | :----------------------------------------------------------------------------- |
| Собрать / развить КС из текста    | GUIDE: концептуализация; `docs/CONCEPTUAL-SCHEMA.md`; `docs/BASE-SELECTION.md` |
| Оценить / отревьюить готовую КС   | GUIDE: ревью; чеклист ревью; `docs/CONCEPTUAL-SCHEMA.md`                       |
| Починить формулу / диагностики    | GUIDE: цикл диагностик; `docs/DIAGNOSTICS.md`                                  |
| Импорт / правка по ссылке Portal  | GUIDE: Portal; `docs/PORTAL-API.md`                                            |
| Проверить смысл на данных         | GUIDE: КМ; `docs/MODEL-TESTING.md`                                             |
| Синтаксис / типизация / вызов API | `docs/SYNTAX.md` / `TYPIFICATION.md` / `REFERENCE.md`                          |

Перед работой всегда открой **GUIDE.md**; остальное — по строке таблицы.

## Не правь пакет rstool без запроса

Разовые скрипты и JSON для Portal — вне дерева пакета (каталог задачи, `.tmp/`, путь пользователя). См. **«Границы правок»** в GUIDE.md.

## Язык ответа пользователю

В тексте для пользователя используй термины предметной области («формальное определение», «конституента», «диагностики»), а не английские имена полей и методов API (`definitionFormal`, `applySchemaPatch`). Идентификаторы API — только в коде, patch-ах и JSON. Словарь API → текст: раздел «Язык ответа» в GUIDE.md. Термины КС (**неопределяемые понятия**, **базисное множество**, ядро) — только из `docs/DOMAIN.md`, раздел **«Термины: не путать»**. Не сокращай «базисное множество» до «базис» / «базисы».

## Portal (приложение)

Репозиторий: [github.com/IRBorisov/ConceptPortal](https://github.com/IRBorisov/ConceptPortal). REST и curl — `rsconcept/rstool/docs/PORTAL-API.md`; карта путей в исходниках — раздел «Репозиторий Portal» в том же файле.

## Кратко

- Typecheck и тесты — из `rsconcept/rstool` (`npm test`, `npm run wrapper`)
- MCP: `@rsconcept/rstool-mcp` (имена tools — `snake_case`, см. REFERENCE)
- `@rsconcept/domain` в этом workspace — в `rsconcept/domain`
