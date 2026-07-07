# Примеры rstool

Полные исполняемые сценарии поверх `RSToolWrapperClient` (stdio-обёртка) и готовые JSON-сессии для импорта. Короткие фрагменты кода для агентов — в [`../skills/rstool-helper/EXAMPLES.md`](../skills/rstool-helper/EXAMPLES.md); воркфлоу — [`../skills/rstool-helper/GUIDE.md`](../skills/rstool-helper/GUIDE.md).

**Агентам:** не добавляйте сюда разовые `build-*.ts` и папки по текущей задаче пользователя. Артефакты и скрипты — вне `rsconcept/rstool/` (см. «Границы правок» в GUIDE). В `examples/` — только сопровождаемые демо пакета.

## Как запускать

После `npm install @rsconcept/rstool` (нужен `tsx` или аналог):

```bash
npx tsx node_modules/@rsconcept/rstool/examples/agent-client.ts
```

Скрипты пишут JSON в `examples/<topic>/` рядом с собой. Запускайте из каталога, где установлен пакет.

## Макет папки темы

У `sample/`, `chocolate-nim/` и `movd/` одинаковая структура:

| Файл               | Роль                                            |
| ------------------ | ----------------------------------------------- |
| `constants.ts`     | Id конституент и пути к JSON-сессиям            |
| `build-rsform.ts`  | Сборка RSForm → `rsform-session.json`           |
| `build-rsmodel.ts` | Демо-модель и проверки → `rsmodel-session.json` |

Готовые `*-session.json` — снимки `exportSession` для `importData` и тестов. Пересобрать: соответствующий `build-*.ts` перезапишет файл рядом с собой.

Перед экспортом каждый `build-*.ts` вызывает [`diagnostics-utils.ts`](diagnostics-utils.ts) (`assertCleanDiagnostics`): expression + schema + model должны быть пусты, иначе скрипт падает. Проверить все снимки: `pnpm run example:audit-diagnostics` ([`audit-diagnostics.ts`](audit-diagnostics.ts)).

## Темы и npm-скрипты

- **[`sample/`](sample/):**
  - Минимальная учебная схема: `X1`, `C1`, `S1`, `D1`, `A1`
  - `build-rsform` скрипт: `example:build-schema`
  - `build-rsmodel` скрипт: `example:build-rsmodel`

- **[`kinship/`](kinship/):**
  - «Родственные отношения» — развёрнутая предметная схема
  - `build-rsform` скрипт: `example:build-kinship-schema`
  - `build-rsmodel` скрипт: `example:build-kinship-rsmodel`

- **[`chocolate-nim/`](chocolate-nim/):**
  - «Шоколадный Ним» — пример математической схемы без `X#`
  - `build-rsform` скрипт: `example:build-chocolate-nim-schema`
  - `build-rsmodel` скрипт: `example:build-chocolate-nim-rsmodel`

- **[`movd/`](movd/):**
  - «МОВД» — пример предметной схемы со сложными `S#`, мультипроекциями и фильтрами
  - `build-rsform` скрипт: `example:build-movd-schema`
  - `build-rsmodel` скрипт: `example:build-movd-rsmodel`

- **[`expression-bank/`](expression-bank/):**
  - «Банк выражений» (Portal rsforms/42) — шаблоны T1–T10 на радикалах `R1`–`R3` без `X#`
  - `build-rsform` скрипт: `example:build-expression-bank-schema`
  - только `rsform-session.json` (без модели)

- **[`template-apply/`](template-apply/):**
  - Небольшая предметная схема: подстановка `R1→X1`, `R2→X2` для шаблонов БВ (F6, F20, P5)
  - `build-rsform` скрипт: `example:build-template-apply-schema` (сборка + проверка на модели в скрипте)
  - только `rsform-session.json`

В корне: [`agent-client.ts`](agent-client.ts) (`example:client`) — минимальный цикл через stdio без привязки к теме.

## Папка `kinship/`

Тот же макет, плюс интерактивное редактирование модели:

| Файл                                               | Роль                                                                      |
| -------------------------------------------------- | ------------------------------------------------------------------------- |
| [`session.ts`](kinship/session.ts)                 | Обёртка: загрузка/сохранение, команды над `X1` и `S1`                     |
| [`x1-actions.ts`](kinship/x1-actions.ts)           | Парсинг и применение изменений списка людей                               |
| [`x1-actions.test.ts`](kinship/x1-actions.test.ts) | Тесты логики `X1` (`npm test`)                                            |
| [`cli.ts`](kinship/cli.ts)                         | REPL (`kinship:cli`): `list`, `add`, `remove`, `rename`, `set`, `save`, … |

По умолчанию CLI читает [`kinship/rsmodel-session.json`](kinship/rsmodel-session.json).

См. также [`../docs/CONSTITUENTA.md`](../docs/CONSTITUENTA.md) и [`../docs/MODEL-TESTING.md`](../docs/MODEL-TESTING.md).
