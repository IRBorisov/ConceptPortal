# Architecture style

Principles for structuring applications so they stay readable as features grow.

## Core idea

Organize by **capability**, not by technical layer alone. A feature owns its screens, API surface, dialogs, and local UI state. Shared code stays thin and generic. Pure domain logic stays free of UI and transport frameworks.

## Layering

Prefer a clear dependency direction:

```
domain / pure logic
        ↓
application API (backend)     UI application (frontend)
        ↓                            ↓
   shared infrastructure      shared UI + transport
```

Rules of thumb:

- **Domain** code must not import React, HTTP clients, validation libraries tied to forms, or UI packages.
- **Adapters** (MCP wrappers, CLI wrappers, thin gateways) marshal input/output only — no duplicated business rules.
- **Backend** and **frontend** sync on the API contract by convention; neither imports the other’s runtime.
- Promote code **up** into shared only when two or more owners clearly need it — not “just in case.”

## Frontend shape

### App shell vs features

| Area              | Owns                                                                                          |
| ----------------- | --------------------------------------------------------------------------------------------- |
| App shell         | Bootstrap, routing, layouts, providers, global hosts                                          |
| Features          | One product capability each: pages, feature UI, API hooks, dialogs, local stores, pure models |
| Shared components | Reusable primitives (inputs, modals, tables, controls)                                        |
| Shared services   | Heavy reusable engines (export, search, workers) used by several features                     |
| Shared stores     | App-wide preferences and layout — not feature-specific filters                                |
| Transport         | HTTP client, query client, auth/CSRF plumbing                                                 |

### Typical feature folders

Use only the folders the feature needs:

- `pages/` — route screens; colocate page-specific panels and toolbars
- `backend/` — API module, request/response schemas, query and mutation hooks
- `components/` — feature-local UI
- `dialogs/` — dialog store, host, and dialog implementations
- `models/` — pure logic (filters, parsers, validators)
- `stores/` — feature UI state
- `index.ts` — **narrow public barrel** (see coding style)

Pages compose hooks, stores, and shared primitives. Keep feature components small and colocated with their use.

### Server state vs client state

| Concern        | Owner         | Examples                                                       |
| -------------- | ------------- | -------------------------------------------------------------- |
| Server / cache | Query library | Lists, entity details, prefetch, invalidation after writes     |
| Client UI      | Local stores  | Dialog open/props, search filters, layout toggles, preferences |

Do not stash server payloads in UI stores. Do not use the query cache as a general UI event bus.

## Backend shape

Organize by **domain app**. Inside an app:

- **Models** — persistence and domain invariants
- **Serializers** — request/response shapes, split by purpose when large
- **Views** — HTTP endpoints; keep them thin
- **Services** — non-trivial side effects and workflows
- **Shared** (cross-app) — permissions, common serializers, throttling, test helpers

Keep logic in the owning app. Move to shared only when reuse is proven. Treat permissions as a first-class, centralized hierarchy applied at the endpoint or object level.

Migrations should be additive by default.

## API contract

- The backend defines the wire format.
- The frontend mirrors it with runtime schemas at the boundary and derives TypeScript types from those schemas.
- Forms may reuse the same schemas for validation.
- Framework-free shared types and enums may live in a domain package; transport validation stays in the consumer.
- Any contract change is **cross-cutting**: update API and client together in the same change set.

## Package / monorepo boundaries

When splitting packages:

| Package role        | Responsibility                                                       |
| ------------------- | -------------------------------------------------------------------- |
| Domain library      | Pure types, algorithms, language/rules — minimal runtime deps        |
| App UI              | Screens and feature wiring; depends on domain, not on agent/adapters |
| Agent / session API | Orchestration over domain for tools and scripts                      |
| Thin adapter        | Maps an external protocol onto the agent API                         |

Dependency arrows point **inward** toward domain. Adapters never become a second home for business logic. Prefer explicit public surfaces (named exports, clear subpaths) over dumping everything through one mega-barrel.

## Documentation as contract

When a package exposes a stable surface to other tools or agents, treat visible changes as contract changes: update code, tests, and docs in the **same** change. Internal refactors that do not alter the surface do not require that sync.
