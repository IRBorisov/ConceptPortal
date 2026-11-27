# Portal: правка ОСС

Граф операционной схемы синтеза (ОСС) через API-ключ. Карта маршрутов — [PORTAL-API.md](PORTAL-API.md); когда делить схему на микротеории и как отождествлять — [METHOD.md](METHOD.md) §«Синтез микротеорий».

## Релятивизация в Portal

Термины — [DOMAIN.md](DOMAIN.md#релятивизация). Для самостоятельного результата в исходной КС
открой «Редактирование» → «Релятивизация». Для результата, связанного с источником, выбери
«Добавить…» → «Релятивизация» на графе ОСС и укажи исходную КС. Оба диалога используют один расчёт.
Укажи релятивизируемую конституенту и задай имя семейства. Портал добавит это имя к терминам фокуса и релятивизированных конституент.
Общие для контекстов понятия можно отметить в списке исключений. Укажи метаданные результата и нажми
«Создать». После выполнения проверь смысл формул и текстов в открывшейся КС. Термины, текстовые
определения и конвенции редактируются в самой схеме результата.

При изменении источника или параметров ОСС пересчитывает связанный результат. Ручные правки текстов и
словоформ сохраняются по полям у соответствующих конституент. Формальные выражения наследников и
артефактов релятивизации можно изменить через исходную КС или параметры. Если фокус — базисное
множество, его наследник — родовая структура контекстов. Копия базисного множества — артефакт операции.

Удаление релятивизируемой конституенты и выявленная невычислимость, внесённая преобразованием,
отклоняют правку источника с откатом транзакции. Перед такой правкой измени параметры операции.

### Сессионные маршруты

- `POST /api/rsforms/:id/create-relativization` принимает `source_time_update`, ID конституенты
  `target`, список ID `excluded`, `locale`, `context_name` и `item_data` с `title`, `alias`
  и необязательным `description`. Возвращает метаданные самостоятельной КС с кодом 201.
- `POST /api/oss/:id/create-relativization` принимает те же параметры, `source_operation`,
  `layout`, `position` и `item_data.parent`. При перенастройке передай `existing_operation`.
  Операция и её результат сохраняют свои идентификаторы. Ответ с кодом 201 содержит
  `{new_operation, oss}`.

Для `locale` укажи язык текстов исходной КС (`en`, `ru` или `fr`). Сервер проверяет
актуальность `source_time_update` и отвечает с кодом 409, если источник успел измениться.
У операции ОСС ровно один аргумент. Источник, результат и параметры видны в `details`
в пределах прав чтения. В `details` результирующей КС поле `projected` перечисляет
управляемые операцией конституенты. Результат участвует в пронесении изменений и может
быть аргументом синтеза.

Для локальной проверки собери `pnpm --filter @rsconcept/domain run build:model-types`, запусти
frontend и Django с отдельной тестовой БД. Для Playwright передай `PORTAL_TEST_SITE`,
`PORTAL_TEST_API`, `PORTAL_TEST_USER` и `PORTAL_TEST_PASSWORD`. Выполни
`pnpm --filter frontend exec playwright test live-relativization.spec.ts --project "Desktop Chrome"`.
Тест создаёт собственные КС и ОСС. Он отправляет заведомо устаревшую ревизию на реальный сервер,
повторяет запись и перечитывает КС и граф.

Для замеров на отдельной локальной БД после миграций запусти в backend
`uv run python manage.py shell -c "from apps.oss.tests.benchmark_relativization import run; run()"`.
Скрипт откатывает свои записи после каждого размера КС.

## Правка ОСС

Тела и HTTP-методы совпадают с сессионными `/api/oss/:id/<действие>`. Отличия:

- `layout` (раскладка графа) **необязателен**. Без него сервер берёт сохранённую раскладку,
  а новые и перемещённые узлы ставит по тем же правилам, что UI.
- `position` новой операции или блока необязателен; можно передать только `{x, y}` —
  размер узла подставится. Координаты абсолютные.
- В `create-block` можно опустить `children_operations` / `children_blocks`,
  в `create-synthesis` — `substitutions` (по умолчанию пустые списки).
- `relocate-constituents` отвечает графом ОСС (сессионный маршрут — пустым `200`).

Все id в телах — числовые id, не шифры. Id операций и блоков бери из
`GET /api/agents/oss/:id/details` (`operations[].id`, `blocks[].id`), id КС-результатов —
из `operations[].result`. Id конституент для `relocate-constituents` и новых отождествлений
в `create-synthesis` бери из `GET /api/agents/rsforms/:id/details` нужной КС (`items[].id`);
уже заданные отождествления видны в `substitutions[]` деталей ОСС. Правка требует права
редактора ОСС; чтение — права читателя. Заголовок `X-Expected-Time-Update` отклоняет устаревшую запись с `409`.

| Метод | Действие                | Тело (главное)                                                                           | Ответ                  |
| ----- | ----------------------- | ---------------------------------------------------------------------------------------- | ---------------------- |
| PATCH | `update-layout`         | `{ data: [{nodeID, x, y, width, height}] }`                                              | ОСС                    |
| POST  | `create-block`          | `item_data{title, description, parent}`, `children_operations`, `children_blocks`        | `{new_block, oss}`     |
| PATCH | `update-block`          | `target`, `item_data{title, description, parent}`                                        | ОСС                    |
| PATCH | `delete-block`          | `target`                                                                                 | ОСС                    |
| PATCH | `move-items`            | `operations`, `blocks`, `destination` (id блока или `null`)                              | ОСС                    |
| POST  | `create-schema`         | `item_data{alias, title, description, parent}` — загрузка с новой пустой КС              | `{new_operation, oss}` |
| POST  | `import-schema`         | `item_data`, `source` (id КС), `clone_source` (`true` — копия, `false` — ссылка)         | `{new_operation, oss}` |
| POST  | `clone-schema`          | `source_operation`                                                                       | `{new_operation, oss}` |
| POST  | `create-replica`        | `target`                                                                                 | `{new_operation, oss}` |
| POST  | `create-synthesis`      | `item_data`, `arguments` (id операций), `substitutions[{original, substitution}]`        | `{new_operation, oss}` |
| PATCH | `update-operation`      | `target`, `item_data{alias, title, description, parent}`, `arguments?`, `substitutions?` | ОСС                    |
| PATCH | `delete-operation`      | `target`, `keep_constituents?`, `delete_schema?`                                         | ОСС                    |
| PATCH | `delete-replica`        | `target`, `keep_connections?`, `keep_constituents?`                                      | ОСС                    |
| PATCH | `create-input`          | `target` — пустая КС для загрузки без схемы                                              | `{new_schema, oss}`    |
| PATCH | `set-input`             | `target`, `input` (id КС или `null`)                                                     | ОСС                    |
| POST  | `execute-operation`     | `target` — построить КС синтеза                                                          | ОСС                    |
| POST  | `relocate-constituents` | `destination` (id КС), `items` (id конституент одной КС)                                 | ОСС                    |

`create-synthesis` сразу строит КС синтеза. Отождествления — пары id конституент из КС
операций-аргументов: `original` удаляется, `substitution` остаётся. `import-schema` требует
права чтения исходной КС. `delete_schema: true` удаляет и КС-результат, если она лежит
в той же папке и у того же владельца, что ОСС.

```bash
# Синтез из двух загрузок без раскладки: сервер поставит узел под аргументами
curl.exe -s -H "Authorization: Bearer rcp_...." -H "Content-Type: application/json" ^
  -d "{\"item_data\": {\"alias\": \"S1\", \"title\": \"Синтез\", \"description\": \"\", \"parent\": null}, \"arguments\": [41, 42], \"substitutions\": [{\"original\": 1201, \"substitution\": 1305}]}" ^
  -X POST "https://api.portal.acconcept.ru/api/agents/oss/77/create-synthesis"
```

Сначала прочитай `GET /api/agents/oss/:id/details`: там id операций, блоков и КС-результатов (`result`). Раскладку не передавай, если не нужно ставить узлы в конкретные координаты.
