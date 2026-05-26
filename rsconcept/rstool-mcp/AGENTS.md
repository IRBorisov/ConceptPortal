# AGENTS.md

Rules for agents in `rsconcept/rstool-mcp`.

## Scope

Applies to all files under `rsconcept/rstool-mcp`. The package is a **thin adapter** over `@rsconcept/rstool` — it must not duplicate validation, business logic, or RS-language behaviour.

## Structure

- `src/server.ts` — builds a low-level MCP `Server` and registers tool handlers using `TOOL_DEFINITIONS`.
- `src/tools.ts` — single source of truth: tool name → description → JSON input schema → invocation onto `RSToolAgent`.
- `src/bin/server.ts` — stdio bin entry (`#!/usr/bin/env node`). Wraps the server with `StdioServerTransport`.
- `src/server.test.ts` — smoke tests over the tool catalog.
- `README.md` — install + Cursor / Claude config + tool table.

## Commands

From `rsconcept/rstool-mcp` (`@rsconcept/rstool` comes from npm unless you `npm link` a local build):

- Install: `npm install`
- Typecheck: `npm run typecheck`
- Tests: `npm test`
- Build: `npm run build`
- Run (dev): `npm run start`
- Run (built bin): `node dist/bin/server.js` or `npx rstool-mcp`

## Edit rules

- **All new tools live in `src/tools.ts`** — add an entry to `TOOL_DEFINITIONS` with a permissive JSON schema and an `invoke` that calls a method on `RSToolAgent`. Do not add handlers in `server.ts`.
- **Mirror rstool changes**: when `@rsconcept/rstool` adds or removes a method, update `TOOL_DEFINITIONS` and the README tool table in the same change set. Update the smoke test's expected list of tool names.
- **No business logic**: validation, error mapping, and session bookkeeping belong in `@rsconcept/rstool`. The adapter only marshals JSON.
- **Permissive schemas**: prefer `additionalProperties: true` for structurally rich payloads; let rstool throw and surface the message through `isError: true` text content.
- **Tool naming**: use `snake_case` for MCP tool names (idiomatic for MCP), even though the underlying rstool methods are camelCase.
- **Shebang**: `src/bin/server.ts` must keep the `#!/usr/bin/env node` shebang at the top — `tsdown` preserves it in the built bin.

## Versioning

- `CONTRACT_VERSION` lives in `@rsconcept/rstool`; bump there for contract changes.
- This package's `package.json` `version` follows its own semver; bump on tool catalog changes or transport-level changes. Release steps: `PUBLISHING.md`.
- `@rsconcept/rstool` is pinned with a `^` range — bumping the rstool version requires re-running tests and updating the smoke test if tool names changed.
