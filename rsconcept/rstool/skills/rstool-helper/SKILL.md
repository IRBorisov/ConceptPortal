---
name: rstool-helper
description: >-
  RSLang, формальные определения и проектирование концептуальных схем для агентов. Читай GUIDE и docs из node_modules.
---

# rstool-helper

Тонкий **входной** skill. Полный гайд и документация остаются в пакете — читай через Read tool по путям ниже (от корня проекта).

## Если входной skill ещё не установлен

Пользователь выполнил `npm install @rsconcept/rstool`, но не зарегистрировал agent skill в проекте. **Выполни процедуру установки** из:

`node_modules/@rsconcept/rstool/skills/INSTALL.md`

Затем продолжай с каноническими файлами ниже.

## Канонические файлы (читать перед работой с rstool)

- **Начни здесь** — воркфлоу и чеклисты: `node_modules/@rsconcept/rstool/skills/rstool-helper/GUIDE.md`
- API, stdio, контракт: `node_modules/@rsconcept/rstool/skills/rstool-helper/REFERENCE.md`
- Примеры, типичные ошибки: `node_modules/@rsconcept/rstool/skills/rstool-helper/EXAMPLES.md`
- Язык и предметная область: `node_modules/@rsconcept/rstool/docs/*.md`
- Процедура установки: `node_modules/@rsconcept/rstool/skills/INSTALL.md`

Перед началом задачи rstool всегда открывай **GUIDE.md**, затем по необходимости **REFERENCE.md** / **EXAMPLES.md** / нужные `docs/*.md`.

## Не правь пакет rstool без запроса

Разовые скрипты и JSON для Portal — вне дерева пакета (каталог задачи, `.tmp/`, путь пользователя). См. **«Границы правок»** в GUIDE.md.

## Язык ответа пользователю

В тексте для пользователя используй термины предметной области («формальное определение», «конституента», «диагностики»), а не английские имена полей и методов API (`definitionFormal`, `applySchemaPatch`). Идентификаторы API — только в коде, patch-ах и JSON. Словарь API → текст: раздел «Язык ответа» в GUIDE.md. Термины КС (базовые понятия, базисное множество, ядро) — только из `docs/DOMAIN.md`, раздел **«Термины: не путать»**.

## Portal (приложение)

REST API и curl — `node_modules/@rsconcept/rstool/docs/PORTAL-API.md`.

## Кратко

- Пакет: `@rsconcept/rstool`; обёртка: `npx rstool-wrapper`
- `@rsconcept/domain` устанавливается как зависимость (анализатор и коды ошибок)
