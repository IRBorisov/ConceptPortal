# Portal REST API (read-only reference)

When an agent needs to **inspect existing** RSForms, OSS, or RSModels persisted on the Portal, use the REST API on `api.portal.acconcept.ru`. The rstool library itself never calls the Portal API — it always works on in-memory sessions. This document is for agents that combine rstool sessions with data fetched from a live Portal.

## Hosts

- **UI:** `https://portal.acconcept.ru/`
- **REST API:** `https://api.portal.acconcept.ru/`

## Path rewrite rules

| Portal UI path                   | REST target                                             |
| -------------------------------- | ------------------------------------------------------- |
| `/rsforms/:id`                   | `GET /api/rsforms/:id` (metadata: owner, titles)        |
| `/rsforms/:id` (full payload)    | `GET /api/rsforms/:id/details`                          |
| `/rsforms/:id` (a saved version) | `GET /api/library/:id/versions/:version`                |
| `/oss/:id`                       | `GET /api/oss/:id` (and the sibling OSS viewset routes) |
| `/models/:id`                    | `GET /api/models/:id` (RSModel router)                  |

## OpenAPI

Machine-readable schema:

```
GET https://api.portal.acconcept.ru/schema
```

Prefer `/schema` for JSON. The Swagger UI is separate.

## What rstool consumes

rstool itself works with in-memory sessions via `RSToolAgent` or the stdio wrapper. To bridge between the REST payload and a rstool session, the typical flow is:

1. `GET /api/rsforms/:id/details` to fetch the persisted RSForm.
2. Convert the response (constituents, formal definitions, term, convention, etc.) into a series of `addOrUpdateConstituenta` calls inside a fresh `createSession`.
3. Operate offline: analyse, edit, evaluate, then `exportSession` for hand-off.

There is no backend write path in rstool: edits never round-trip to the Portal automatically. Publish changes back to the Portal through the existing Portal UI or REST writes.

## Don'ts

- Do not scrape the SPA HTML.
- Do not pass UI hash params (`?tab=editor`, etc.) to REST.
- Do not call `/api/rsforms/:id/details` for trivial metadata — `GET /api/rsforms/:id` is cheaper.
- Do not assume the API host is the same as the UI host in production — they are different.
