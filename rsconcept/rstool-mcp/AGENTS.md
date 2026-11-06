# AGENTS.md

Rules for agents in `rsconcept/rstool-mcp`.

## Scope

Applies to all files under `rsconcept/rstool-mcp`. The package is a **thin adapter** over `@rsconcept/rstool` — it must not duplicate validation, business logic, or RS-language behaviour.

## See also

- Portable guides: [`docs/architecture.md`](../../docs/architecture.md), [`docs/coding-style.md`](../../docs/coding-style.md) (package rules win on conflict)
- Upstream contract: [`../rstool/AGENTS.md`](../rstool/AGENTS.md) §Contract changes

## Structure

- `src/server.ts` — builds an MCP `McpServer` and registers tool handlers on `server.server` using `TOOL_DEFINITIONS`.
- `src/tools.ts` — single source of truth: tool name → description → JSON input schema → invocation onto `RSToolAgent`.
- `src/bin/server.ts` — stdio bin entry (`#!/usr/bin/env node`). Wraps the server with `StdioServerTransport`.
- `src/http-server.ts` — authenticated Streamable HTTP host; owns transport leases and identity/workspace isolation, not rstool session logic.
- `src/http-auth.ts` — bearer credentials mapped to stable subjects; callers can supply a different trusted verifier.
- `src/bin/http-server.ts` — HTTP bin entry; requires credentials and a persistence root.
- `src/http-server.test.ts` — real MCP clients over loopback, isolation and restart checks.
- `src/server.test.ts` — smoke tests over the tool catalog.
- `README.md` — install + Cursor / Claude config + tool table.
- `HTTP.md` — hosted transport configuration, workspace lifetime and deployment boundaries.

## Commands

From repo root (pnpm workspace; `@rsconcept/rstool` links to `rsconcept/rstool`):

- Install: `pnpm install` then build domain and rstool
- Typecheck: `pnpm --filter @rsconcept/rstool-mcp run typecheck`
- Tests: `pnpm --filter @rsconcept/rstool-mcp test`
- Build: `pnpm --filter @rsconcept/rstool-mcp run build`
- Run (dev): `pnpm --filter @rsconcept/rstool-mcp run start`
- Run (HTTP dev): `pnpm --filter @rsconcept/rstool-mcp run start:http` (required environment in `HTTP.md`)
- Run (built bin): `node dist/bin/server.js` or `npx rstool-mcp`

## Edit rules

- **All new tools live in `src/tools.ts`** — RS tools in `TOOL_DEFINITIONS` invoke `RSToolAgent`. Optional Portal integration tools are created by `portalToolDefinitions` with trusted host identity and delegate to `PortalPublisher`. Do not add tool handlers in `server.ts`.
- **Mirror rstool changes**: when `@rsconcept/rstool` adds or removes a method, update `TOOL_DEFINITIONS` and the README tool table in the same change set. Update the smoke test's expected list of tool names.
- **No business logic**: validation, error mapping, and session bookkeeping belong in `@rsconcept/rstool`. The adapter only marshals JSON.
- Portal transport, encrypted credential binding and human approval are external integration concerns in `portal-*.ts`, not RS-language logic. Never expose key management or a confirmation operation as an MCP tool. Account APIs derive subject from host auth, not body/query data.
- HTTP authentication, transport ownership and limits belong in the HTTP host. Never share a mutable `RSToolAgent` across identities or live workspace leases. Preserve the stdio contract.
- `buildRSToolMcpServer` serializes tool calls by default on all transports. Only an explicit `serializeToolCalls: false` opts out; the library's optimistic model commit still protects against stale writes.
- **Permissive schemas**: prefer `additionalProperties: true` for structurally rich payloads; let rstool throw and surface the message through `isError: true` text content.
- **Tool naming**: use `snake_case` for MCP tool names (idiomatic for MCP), even though the underlying rstool methods are camelCase.
- **Shebang**: `src/bin/server.ts` must keep the `#!/usr/bin/env node` shebang at the top — `tsdown` preserves it in the built bin.

## Versioning

- `CONTRACT_VERSION` lives in `@rsconcept/rstool`; bump there for contract changes.
- This package's `package.json` `version` follows its own semver; bump on tool catalog changes or transport-level changes. Release steps: `PUBLISHING.md`.
- `@rsconcept/rstool` is pinned with a `^` range — bumping the rstool version requires re-running tests and updating the smoke test if tool names changed.
