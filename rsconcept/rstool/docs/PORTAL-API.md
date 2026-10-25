# Portal REST API

Указатель. Portal — веб-приложение для КС, ОСС и моделей; `rstool` с REST не работает, агент получает JSON отдельно.

| Задача                                                         | Файл                                   |
| :------------------------------------------------------------- | :------------------------------------- |
| Ссылка Portal → API, доступ и ключи, поиск, `/details`, импорт | [PORTAL-READ.md](PORTAL-READ.md)       |
| Создать / заменить КС, версии, протокол публикации, лимиты     | [PORTAL-PUBLISH.md](PORTAL-PUBLISH.md) |
| Интерпретации концептуальной модели                            | [PORTAL-MODELS.md](PORTAL-MODELS.md)   |
| Граф ОСС: загрузки, синтезы, блоки                             | [PORTAL-OSS.md](PORTAL-OSS.md)         |

Хосты: UI `https://portal.acconcept.ru/`, REST `https://api.portal.acconcept.ru/`. OpenAPI — `GET https://api.portal.acconcept.ru/schema`.

## Маршруты агентов (`/api/agents`, Bearer API-ключ)

| Метод | Путь                                           | Назначение                                       |
| ----- | ---------------------------------------------- | ------------------------------------------------ |
| GET   | `/api/agents/library/active`                   | Метаданные доступных объектов                    |
| GET   | `/api/agents/library/context-search`           | Поиск (те же query-параметры)                    |
| GET   | `/api/agents/library/by-ids`                   | Метаданные по id                                 |
| POST  | `/api/agents/rsforms`                          | Создать КС                                       |
| GET   | `/api/agents/rsforms/:id/details`              | Полная КС                                        |
| PATCH | `/api/agents/rsforms/:id/replace`              | Заменить содержимое (`exportPortal` / load-json) |
| POST  | `/api/agents/rsforms/:id/create-version`       | Снимок версии (owner/staff)                      |
| POST  | `/api/agents/rsforms/:id/constituents`         | Создать конституенту                             |
| PATCH | `/api/agents/rsforms/:id/constituents/:cst_id` | Обновить конституенту                            |
| POST  | `/api/agents/rsforms/:id/constituents/delete`  | Удалить список конституент                       |
| POST  | `/api/agents/rsforms/:id/substitute`           | Подстановка                                      |
| PATCH | `/api/agents/rsforms/:id/move-cst`             | Перемещение                                      |
| GET   | `/api/agents/models/:id/details`               | Модель и текущие интерпретации                   |
| POST  | `/api/agents/models/:id/set-value`             | Записать интерпретации конституент               |
| POST  | `/api/agents/models/:id/clear-values`          | Сбросить интерпретации списка конституент        |
| POST  | `/api/agents/models/:id/reset-all`             | Сбросить все интерпретации модели                |
| POST  | `/api/agents/oss`                              | Создать пустую ОСС                               |
| GET   | `/api/agents/oss/:id/details`                  | Граф ОСС: операции, блоки, аргументы, раскладка  |
| \*    | `/api/agents/oss/:id/<действие>`               | Правка ОСС, см. [PORTAL-OSS.md](PORTAL-OSS.md)   |

## Репозиторий Portal

Исходники: [github.com/IRBorisov/ConceptPortal](https://github.com/IRBorisov/ConceptPortal) — backend `rsconcept/backend` (`apps.agents` — ключи и маршруты `/api/agents`), frontend `rsconcept/frontend`.
