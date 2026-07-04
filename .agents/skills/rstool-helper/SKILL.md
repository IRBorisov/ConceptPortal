---
name: rstool-helper
description: >-
  RSLang, формальные определения и проектирование концептуальных схем для агентов. Читай GUIDE и docs из rsconcept/rstool в репозитории.
---

# rstool-helper (Concept Portal workspace)

Тонкий входной skill для этого репозитория. Для работы **в дереве** не делай `npm install @rsconcept/rstool` — библиотека и документация лежат в `rsconcept/rstool/`.

Если skill скопирован в проект, где `@rsconcept/rstool` установлен из npm, используй пути пакета под `node_modules/@rsconcept/rstool/`. В workspace Portal всегда предпочитай in-repo файлы — они соответствуют локальному коду под правкой.

## Канонические файлы (читать перед работой с rstool)

Пути — от **корня workspace**.

| Что                                                     | Путь                                                 |
| :------------------------------------------------------ | :--------------------------------------------------- |
| **Начни здесь** — воркфлоу, чеклисты, cstType, S# vs D# | `rsconcept/rstool/skills/rstool-helper/GUIDE.md`     |
| API, stdio, контракт                                    | `rsconcept/rstool/skills/rstool-helper/REFERENCE.md` |
| Примеры, типичные ошибки                                | `rsconcept/rstool/skills/rstool-helper/EXAMPLES.md`  |
| Язык и предметная область                               | `rsconcept/rstool/docs/*.md`                         |
| Правила агента для пакета                               | `rsconcept/rstool/AGENTS.md`                         |

Перед началом задачи rstool всегда открывай **GUIDE.md**, затем по необходимости **REFERENCE.md** / **EXAMPLES.md** / нужные `docs/*.md`.

## Язык ответа пользователю

В тексте для пользователя используй термины предметной области («формальное определение», «конституента», «диагностики»), а не английские имена полей и методов API (`definitionFormal`, `applySchemaPatch`). Идентификаторы API — только в коде, patch-ах и JSON. Словарь соответствий — раздел «Язык ответа» в GUIDE.md.

## Portal (приложение)

Репозиторий: [github.com/IRBorisov/ConceptPortal](https://github.com/IRBorisov/ConceptPortal). REST и curl — `rsconcept/rstool/docs/PORTAL-API.md`; карта путей в исходниках — раздел «Репозиторий Portal» в том же файле.

## Кратко

- Typecheck и тесты — из `rsconcept/rstool` (`npm test`, `npm run wrapper`)
- `@rsconcept/domain` в этом workspace — в `rsconcept/domain`
