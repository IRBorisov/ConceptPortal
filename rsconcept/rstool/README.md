# @rsconcept/rstool

Agent-facing library for **incremental RSForm construction**, **RSLang expression analysis**, **diagnostics**, **modeling**, and **evaluation**. It wraps [`@rsconcept/domain`](https://www.npmjs.com/package/@rsconcept/domain) with a deterministic session contract and a stdio JSON wrapper for LLM agents. MCP hosts can use it through [`@rsconcept/rstool-mcp`](https://www.npmjs.com/package/@rsconcept/rstool-mcp).

**Contract version:** `3.3.1` — see [skills/rstool-runtime/REFERENCE.md](./skills/rstool-runtime/REFERENCE.md) for the full v3 API.

## Agent skill

Agents build conceptual schemas that answer the user's request, not just pass the analyzer. The router skill `skills/rstool/` picks the scenario and names the stage skills (`skills/rs-scope`, `rs-core`, `rs-explicate`, `rs-interpret`, `rs-review`, `rs-synthesis`, `rs-explain`, `rs-portal`, `rstool-runtime`). The method is in `docs/METHOD.md`; a schema brief (`docs/BRIEF.md`) holds the expressiveness requirements, decisions and labelled scenarios, checked by `skills/scripts/check-brief.ts`. Only a **stub** of the router is installed into the project; see [Installing the agent skill](#installing-the-agent-skill) below.

## Install

```bash
npm install @rsconcept/rstool
```

`@rsconcept/domain` is a package dependency and is installed automatically.

## Installing the agent skill

After `npm install @rsconcept/rstool`, **you do not copy files yourself**. Ask your agent, for example:

> Install the rstool agent skill according to the package instructions.

The agent should read and follow:

`node_modules/@rsconcept/rstool/skills/INSTALL.md`

The procedure is agent-neutral: the agent adds a routing line to the project `AGENTS.md` (or the instructions file its host loads) and, if its host loads a project skills folder, a stub `rstool/SKILL.md` there (name, description and a path into `node_modules`; `npx rstool-skills install --dir <skills-dir>`). The skills and `docs/*.md` stay in the package and are read from `node_modules` when needed, so nothing is re-copied after an update.

Details: `skills/README.md`.

## Quick use (library)

```ts
import { RSToolAgent } from '@rsconcept/rstool';

const tool = new RSToolAgent();
const result = tool.applySchemaPatch({
  items: [{ alias: 'X1' }, { alias: 'D1', definitionFormal: '1+2' }]
});
```

## Quick use (stdio wrapper)

```bash
npx rstool-wrapper      # one JSON request per line on stdin, one JSON response per line on stdout
```

Or run it as a child process from your own code:

```ts
import { RSToolWrapperClient } from '@rsconcept/rstool/wrapper';

const client = new RSToolWrapperClient({ command: 'npx', args: ['rstool-wrapper'] });
await client.waitUntilReady();
const session = await client.call<{ sessionId: string }>('createSession');
await client.close();
```

## Scope

- Session-based incremental editing of constituents.
- Parse / syntax / semantic / type analysis for expressions.
- In-memory modeling: set base bindings and structured values; evaluate expressions and constituents.
- Deterministic diagnostics and export/import for reproducible agent workflows.

## Session integrity

`setModelValues` works on a detached draft. Reads see the last committed state while it runs. If another operation changes that session before the draft commits, the promise rejects with `Session changed during model update; read the current state and retry`. The newer edit is preserved. Await each write when using the library directly; independent sessions can update concurrently.

Schema patches, synthesis, ordering, recalculation and diagnostic/revision updates stage their synchronous changes in memory. A persistence failure restores the previous live state. Returned model, schema and diagnostic data do not grant mutable access to the committed session.

The stdio handler and MCP server serialize requests per agent by default, including JSON-RPC tool batches. Custom MCP hosts can explicitly disable `serializeToolCalls`; direct concurrent library calls still use the draft conflict check.

Persistence writes and flushes a private temporary sibling before renaming it over the target. Failed writes, flushes and renames leave the previous target intact. Session files and `_current.json` are individually atomic, not a multi-file transaction. If the pointer update fails after a new session was saved, the complete session file can remain while the active pointer stays unchanged. Filesystem/hardware durability across power loss and multiple writers are outside this guarantee. Use one live agent per persistence directory and retain backups. Persisted session IDs cannot be `_current` or Windows device names and cannot contain path separators, `..`, control characters or Windows filename metacharacters.

On resume, an unsafe ID in an existing `_current.json` is treated as an absent pointer, allowing `ensureSession` to create a fresh session. The legacy session file is left untouched.

## Publishing

Maintainers: see [PUBLISHING.md](./PUBLISHING.md) for npm release steps.

## Stdio protocol

- Input: one JSON request per line.
- Output: one JSON response per line.
- The wrapper keeps state in memory while the process is alive (or on disk when `RSTOOL_PERSISTENCE_DIR` is set).
- If a session method is called without an active session, rstool creates one lazily.
- On startup, a ready handshake is printed.

Supported methods (contract `3.3.1`):

- `ping`
- `methods`
- `ensureSession`
- `createSession`
- `getCurrentSession`
- `setCurrentSession`
- `applySchemaPatch`
- `getSessionState`
- `analyzeExpression`
- `listDiagnostics`
- `commitStep`
- `exportSession`
- `exportPortal`
- `importData`
- `setModelValues`
- `getModelState`
- `evaluate`
- `recalculateModel`
- `restoreOrder`
- `synthesize`

Params are **flat** at the top level (no `params.input` wrapper). Optional `sessionId` sits alongside method fields. `listDiagnostics` takes flat `constituentId` / `kind` / `severity` filters (a legacy nested `filters` object is still accepted).

Example `createSession`:

Request:

```json
{ "id": "1", "method": "createSession", "params": {} }
```

Response:

```json
{ "id": "1", "ok": true, "result": { "sessionId": "...", "contractVersion": "3.3.1" } }
```

Example `applySchemaPatch`:

Request:

```json
{
  "id": "2",
  "method": "applySchemaPatch",
  "params": {
    "items": [
      { "alias": "X1" },
      { "alias": "S1", "definitionFormal": "ℬ(X1×X1)" },
      { "alias": "D1", "definitionFormal": "Pr1(S1)" }
    ]
  }
}
```

Response:

```json
{
  "id": "2",
  "ok": true,
  "result": {
    "success": true,
    "session": { "sessionId": "...", "contractVersion": "3.3.1" },
    "summary": { "itemCount": 3 }
  }
}
```

## Typed client example

Run:

```bash
npx tsx node_modules/@rsconcept/rstool/examples/agent-client.ts
```

File: [`examples/agent-client.ts`](examples/agent-client.ts)

## License

MIT

### Trusted storage lifecycle hooks

`RSToolAgentOptions.sessionLifecycle` optionally supplies synchronous `beforeCreate`, `created`, and `access` hooks plus an optional `onEviction` cache callback binding for a trusted host. Hooks cover persisted creation/import and cached reads; a rejected access cannot revive expired data. `beforeCreate` runs before saving, `created` after saving the envelope, and `access` before cached/disk lookup. Hosts must preserve single-process storage ownership, enforce concurrency and avoid exposing secrets in errors. Ordinary library and stdio construction without these hooks keeps its existing behavior. Hosted MCP account quota, retention, migration and structured error codes are documented in [HTTP service](https://github.com/IRBorisov/ConceptPortal/blob/main/rsconcept/rstool-mcp/HTTP.md).

A trusted retention host that invokes the external `onEviction` binding also clears that removed session's in-memory current selection. Hosted HTTP clears the persisted pointer before removal; explicit references to removed sessions still fail. Account-wide config/list/delete operations belong to the host and are documented in the MCP HTTP guide, not additional rstool language methods.
