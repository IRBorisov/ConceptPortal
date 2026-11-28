# Portal REST API

ConceptPortal предоставляет REST API для КС, ОСС и моделей. В Node.js его можно вызвать через `PortalClient` из `@rsconcept/rstool/portal`. Данные КС или КМ загружаются в сессию отдельным вызовом `RSToolAgent.importData`. [Пример клиента](../README.md#read-portal-through-rest)

| Задача                                                         | Файл                                   |
| :------------------------------------------------------------- | :------------------------------------- |
| Ссылка Portal → API, доступ и ключи, поиск, `/details`, импорт | [PORTAL-READ.md](PORTAL-READ.md)       |
| Создать / заменить КС, версии, протокол публикации, лимиты     | [PORTAL-PUBLISH.md](PORTAL-PUBLISH.md) |
| Интерпретации концептуальной модели                            | [PORTAL-MODELS.md](PORTAL-MODELS.md)   |
| Релятивизация КС, граф ОСС, загрузки, синтезы, блоки           | [PORTAL-OSS.md](PORTAL-OSS.md)         |

Хосты: UI `https://portal.acconcept.ru/`, REST `https://api.portal.acconcept.ru/`. OpenAPI — `GET https://api.portal.acconcept.ru/schema`.

«Папки» библиотеки задаются полем `location` элементов. Создание КС сразу с нужным путём описано в [PORTAL-PUBLISH.md](PORTAL-PUBLISH.md) §«Новая КС»; отдельной операции создания папки не требуется.

## Маршруты агентов (`/api/agents`)

Доступ к публичным объектам проверяется анонимно. Для закрытого доступа REST-клиент использует API-ключ, а настроенный MCP-хост может действовать по отдельному полномочию Portal. [Правила доступа](PORTAL-READ.md#доступ)

| Метод | Путь                                           | Назначение                                       |
| ----- | ---------------------------------------------- | ------------------------------------------------ |
| POST  | `/api/agents/rsforms/:id/description`           | Только описание с CAS по `expected_time_update`   |
| GET   | `/api/agents/me`                               | ID и имя владельца, права и срок действия        |
| GET   | `/api/agents/capabilities`                     | Поддержка серверных квитанций (`mutation_receipts: 1`) |
| GET   | `/api/agents/library/:id/access`               | Метаданные доступного объекта, право правки и публикации |
| GET   | `/api/agents/receipts/:operation`               | Квитанция по `Idempotency-Key` и текущим правам чтения |
| POST  | `/api/agents/rsforms/:id/publish`               | Замена по редакции с атомарным снимком, owner/staff |
| GET   | `/api/agents/library/active`                   | Метаданные доступных объектов                    |
| GET   | `/api/agents/library/context-search`           | Поиск (те же query-параметры)                    |
| GET   | `/api/agents/library/by-ids`                   | Метаданные по id                                 |
| PATCH | `/api/agents/library/:id/set-location`         | Расположение (владелец или staff)                |
| PATCH | `/api/agents/library/:id/set-access-policy`    | Политика доступа (владелец или staff)            |
| POST  | `/api/agents/rsforms`                          | Создать КС с `location` и необязательным содержимым в `schema` |
| GET   | `/api/agents/rsforms/:id/details`              | Полная КС                                        |
| PATCH | `/api/agents/rsforms/:id/replace`              | Загрузить содержимое в собственную пустую КС |
| POST  | `/api/agents/rsforms/:id/create-version`       | Снимок версии (owner/staff)                      |
| POST  | `/api/agents/rsforms/:id/constituents`         | Создать конституенту                             |
| PATCH | `/api/agents/rsforms/:id/constituents/:cst_id` | Обновить конституенту                            |
| POST  | `/api/agents/rsforms/:id/constituents/delete`  | Удалить список конституент                       |
| POST  | `/api/agents/rsforms/:id/substitute`           | Подстановка                                      |
| PATCH | `/api/agents/rsforms/:id/move-cst`             | Перемещение                                      |
| POST  | `/api/agents/models`                           | Создать модель для доступной КС, поле `schema` обязательно |
| GET   | `/api/agents/models/:id/details`               | Модель и текущие интерпретации                   |
| POST  | `/api/agents/models/:id/set-value`             | Записать интерпретации конституент               |
| POST  | `/api/agents/models/:id/clear-values`          | Сбросить интерпретации списка конституент        |
| POST  | `/api/agents/models/:id/reset-all`             | Сбросить все интерпретации модели                |
| POST  | `/api/agents/oss`                              | Создать пустую ОСС                               |
| GET   | `/api/agents/oss/:id/details`                  | Граф ОСС: операции, блоки, аргументы, раскладка  |
| \*    | `/api/agents/oss/:id/<действие>`               | Правка ОСС, см. [PORTAL-OSS.md](PORTAL-OSS.md)   |

## Репозиторий Portal

Маршруты реализованы в `rsconcept/backend/apps/agents`. Поля записи, значения `:operation` и формат квитанций описаны в [PORTAL-PUBLISH.md](PORTAL-PUBLISH.md).
