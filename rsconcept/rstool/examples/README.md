# Примеры rstool

Полные исполняемые сценарии поверх `RSToolWrapperClient` (stdio-обёртка) и готовые JSON-сессии для импорта. Короткие фрагменты кода для агентов — в [`../skills/rstool-helper/EXAMPLES.md`](../skills/rstool-helper/EXAMPLES.md); воркфлоу — [`../skills/rstool-helper/GUIDE.md`](../skills/rstool-helper/GUIDE.md).

## Как запускать

**Из checkout репозитория** (`rsconcept/rstool`):

```bash
npm install
npm run build          # обёртка для скриптов
npm run example:client # и остальные example:* / kinship:cli — см. ниже
```

**После `npm install @rsconcept/rstool`** (нужен `tsx` или аналог):

```bash
npx tsx node_modules/@rsconcept/rstool/examples/agent-client.ts
```

Скрипты пишут JSON рядом с собой в `examples/`; запускайте из корня пакета (каталог, где лежит `package.json` rstool).

## Скрипты

| Файл | npm-скрипт | Назначение |
|------|------------|------------|
| [`agent-client.ts`](agent-client.ts) | `example:client` | Минимальный цикл: сессия, upsert, анализ, значения, диагностики через stdio |
| [`build-sample-rsform.ts`](build-sample-rsform.ts) | `example:build-schema` | Собрать учебную RSForm (X1, S1, D1) и сохранить сессию |
| [`build-sample-rsmodel.ts`](build-sample-rsmodel.ts) | `example:build-rsmodel` | RSForm + привязки + вычисления → учебная RSModel |
| [`build-kinship-rsform.ts`](build-kinship-rsform.ts) | `example:build-kinship-schema` | Полная концептуальная схема «родственные отношения» (много конституент) |
| [`build-kinship-rsmodel.ts`](build-kinship-rsmodel.ts) | `example:build-kinship-rsmodel` | Загрузить kinship RSForm, задать семью, вычислить модель (в т.ч. D3) |
| [`kinship/cli.ts`](kinship/cli.ts) | `kinship:cli` | Интерактивное редактирование людей (X1) и связей (S1) в kinship-модели |

## JSON-сессии

Готовые снимки `exportSession` — для `importSession`, тестов и CLI:

| Файл | Содержимое |
|------|------------|
| [`sample-rsform-session.json`](sample-rsform-session.json) | Учебная RSForm (результат `build-sample-rsform`) |
| [`sample-rsmodel-session.json`](sample-rsmodel-session.json) | Учебная RSModel с вычисленными значениями |
| [`kinship-rsform-session.json`](kinship-rsform-session.json) | Схема родства без привязок |
| [`kinship-rsmodel-session.json`](kinship-rsmodel-session.json) | Kinship-модель с примерной семьёй (по умолчанию для `kinship:cli`) |

Пересобрать JSON: соответствующий `build-*.ts` перезапишет файл в `examples/`.

## Папка `kinship/`

Вспомогательный код для сценария «родственные отношения», не отдельный пакет:

| Файл | Роль |
|------|------|
| [`constants.ts`](kinship/constants.ts) | Id конституент (X1, S1, D3, A1, …) и путь сессии по умолчанию |
| [`session.ts`](kinship/session.ts) | Обёртка над сессией: загрузка/сохранение, команды над X1 и S1 |
| [`x1-actions.ts`](kinship/x1-actions.ts) | Парсинг и применение изменений списка людей |
| [`x1-actions.test.ts`](kinship/x1-actions.test.ts) | Тесты логики X1 (`npm test`) |
| [`cli.ts`](kinship/cli.ts) | REPL: `list`, `add`, `remove`, `rename`, `set`, `save`, … |

См. также [`../docs/CONSTITUENTA.md`](../docs/CONSTITUENTA.md) (разбор kinship-схемы) и [`../docs/MODEL-TESTING.md`](../docs/MODEL-TESTING.md).
