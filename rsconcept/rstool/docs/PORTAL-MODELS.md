# Portal: интерпретации модели

Чтение и правка концептуальной модели (RSModel) на Portal через API-ключ. Карта маршрутов — [PORTAL-API.md](PORTAL-API.md).

## Интерпретации модели

Тело совпадает с сессионными `/api/models/:id/set-value`, `clear-values` и `reset-all`.
Ответ — та же модель, что у `GET /api/agents/models/:id/details`: метаданные, `schema`
(id связанной КС) и `items[]` с полями `id`, `type`, `value`.

`target` и элементы `items` — id конституент **связанной** КС, не шифры. Чужая конституента
или модель без схемы → `400`. КС, переданная как id модели → `404`. Правка требует права
редактора; чтение — права читателя. Необязательный заголовок `X-Expected-Time-Update`
(значение `time_update` из предыдущего ответа) отклоняет устаревшую запись с `409`.

```bash
curl.exe -s -H "Authorization: Bearer rcp_...." -H "Content-Type: application/json" ^
  -d "[{\"target\": 1201, \"type\": \"basic\", \"data\": {\"1\": \"a\"}}]" ^
  -X POST "https://api.portal.acconcept.ru/api/agents/models/900/set-value"
```

`clear-values` принимает `{ "items": [1201, 1202] }`. `reset-all` — `POST` без тела.

Сначала прочитай `GET /api/agents/models/:id/details`, чтобы взять id связанной КС и id конституент. Проверку смысла схемы на данных удобнее делать локально в `rstool` (сценарии брифа); на Portal пиши уже проверенные интерпретации.
