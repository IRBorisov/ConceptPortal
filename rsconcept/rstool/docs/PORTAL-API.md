# Portal REST API

Справка только для чтения существующих КС, ОСС и RSModel. `rstool` сам не ходит в REST API: он работает с in-memory сессиями.

## Хосты

- UI: `https://portal.acconcept.ru/`
- REST API: `https://api.portal.acconcept.ru/`

## Пути

- `/rsforms/:id` в UI → `GET /api/rsforms/:id` для метаданных.
- Полная КС → `GET /api/rsforms/:id/details`.
- Версия КС → `GET /api/library/:id/versions/:version`.
- ОСС → `GET /api/oss/:id` и соседние routes viewset.
- Модель → `GET /api/models/:id`.
- OpenAPI JSON → `GET https://api.portal.acconcept.ru/schema`.

## Как перенести КС в rstool

1. Получи `GET /api/rsforms/:id/details`.
2. Создай `createSession`.
3. Перенеси конституенты через `addOrUpdateConstituenta`: `alias`, `cstType`, `definitionFormal`, `term`, `definitionText`, `convention`.
4. Работай локально: анализ, правки, вычисления.
5. Для передачи результата используй `exportSession`.

## Не делай

- Не парси HTML SPA.
- Не переноси UI query/hash вроде `?tab=editor` в REST.
- Не запрашивай UI напрямую, используй преобразованные API запросы.
- Не запрашивай `/details`, если нужны только метаданные.
