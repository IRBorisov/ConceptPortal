# @rsconcept/rstool

Agent-facing library for **incremental RSForm construction**, **RSLang expression analysis**, **diagnostics**, **modeling**, and **evaluation**. It wraps [`@rsconcept/domain`](https://www.npmjs.com/package/@rsconcept/domain) with a deterministic session contract, available through the library, stdio and HTTP RPC. MCP clients use the separate [`@rsconcept/rstool-mcp`](https://www.npmjs.com/package/@rsconcept/rstool-mcp) adapter.

**Contract version:** `4.1.0` — see [skills/rstool-runtime/REFERENCE.md](./skills/rstool-runtime/REFERENCE.md) for the full v4 API.

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

## HTTP and Portal REST

### Start the rstool RPC service

The `rstool-http` bin ships with rstool 3.3.0. From a project with the package installed, set `RSTOOL_RPC_TOKEN_FILE` to a private file containing a random bearer token of 32–4096 non-whitespace characters and `RSTOOL_RPC_PROJECT` to a project ID. The ID starts with an ASCII letter or digit and can contain up to 64 letters, digits, dots, underscores or hyphens. Then run `npx --no-install rstool-http`. It listens on `127.0.0.1:8788`, with the port configurable via `RSTOOL_RPC_PORT`.

`GET /v1/contract` lists the operations and JSON envelope schemas. Send a session export with each CLI request that needs prior state. A shared deployment can use `createRSToolRpcServer` from `@rsconcept/rstool/http` with its own credential verifier and a private agent per authenticated subject and project. Computations run in-process. Use this service with trusted callers, and terminate TLS at the gateway for remote access. [HTTP RPC contract](skills/rstool-runtime/REFERENCE.md#http-api-rstool)

The server gives `verifyToken` an abort signal and five seconds by default. A timeout returns `503 AUTH_TIMEOUT`, and the host can set `verifyTimeoutMs`. The response size limit applies to successful and failed `POST /v1/rpc` calls. A `413 RESPONSE_TOO_LARGE` response uses `id: null` if the original ID would put the error over the limit.

This Python example sends `session.json` from the current directory to the default local port.

```python
import json
import os
from pathlib import Path
from urllib.request import Request, urlopen

token = Path(os.environ['RSTOOL_RPC_TOKEN_FILE']).read_text(encoding='utf-8').strip()
data = json.dumps({'id': 1, 'method': 'listDiagnostics',
                   'state': {'session': Path('session.json').read_text(encoding='utf-8')}}).encode()
request = Request('http://127.0.0.1:8788/v1/rpc', data=data,
                  headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'})
with urlopen(request, timeout=20) as response:
    print(json.load(response))
```

### Read Portal through REST

```ts
import { PortalClient } from '@rsconcept/rstool/portal';

const portal = new PortalClient('https://api.portal.acconcept.ru');
const metadata = await portal.getAccess(856, { anonymous: true });
```

Supply a trusted `credential` callback for protected operations. `getDetails` loads full schema, model or OSS data for import. The REST API is provided by ConceptPortal, and the instance serves its OpenAPI document at `/schema`. [Portal REST map](docs/PORTAL-API.md)

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

The npm release checklist lives in the repository. [PUBLISHING.md](https://github.com/IRBorisov/ConceptPortal/blob/main/rsconcept/rstool/PUBLISHING.md)

## Stdio protocol

- Input: one JSON request per line.
- Output: one JSON response per line.
- The wrapper keeps state in memory while the process is alive (or on disk when `RSTOOL_PERSISTENCE_DIR` is set).
- Session-dependent reads, analysis, exports and evaluation require an existing current session or explicit sessionId. Call ensureSession/createSession only when a session is needed; otherwise NO_CURRENT_SESSION is returned. getCurrentSession itself returns null when none exists.
- On startup, a ready handshake is printed.

Supported methods (contract `4.1.0`):

- `ping`
- `methods`
- `ensureSession`
- `createSession`
- `getCurrentSession`
- `setCurrentSession`
- `applySchemaPatch`
- `getSessionState`
- `analyzeExpression`
- `previewStructure` — preview Portal's structure tree by `constituentId`, with links and formal definition matches
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
{ "id": "1", "ok": true, "result": { "sessionId": "...", "contractVersion": "4.1.0" } }
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
    "session": { "sessionId": "...", "contractVersion": "4.1.0" },
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


## Contract 4 migration

rstool 3.0.0 requires an existing current session for reads, analysis, exports and evaluation. Previously these calls could create an empty session implicitly. Call `ensureSession()` or `createSession()` first, or pass an existing session ID. `applySchemaPatch` retains its documented creation path. `NO_CURRENT_SESSION` and `SESSION_NOT_FOUND` are exported `RSToolError` codes and are preserved by stdio/MCP. Ordinary library/stdio hosts do not gain HTTP account storage tools.

Evaluation and recalculation now return `statusName` alongside numeric `status`. `success` reports technical evaluation success; check the status, value and supplied model bindings before drawing conclusions. X/C basic bindings are label objects such as `{"0":"one","1":"two"}`, not arrays of labels. MCP object results include `structuredContent` as well as compatible text; errors include a structured code and message.

## Trusted computation hosting

`@rsconcept/rstool/hosting` exports `HostedRSToolAgent` and `ExecutionSnapshot` for transport hosts. Capture only invocation source sessions, seed a transient in-memory agent, then commit its completed snapshot through the original authoritative agent. The commit compares all sources and the original selection before changing one session, preserving lifecycle, quota and atomic persistence rules. This is a trusted integration API, not an additional language method or a remote snapshot/filename input.

The optional storage lifecycle hook `beforeWrite(sessionId, serializedBytes)` can reject a serialized envelope before persistence or cache publication. A rejected write preserves the previous model. The MCP Streamable HTTP host supplies storage and computation limits and owns child-process cancellation. The standalone rstool RPC service bounds its HTTP payloads and runs computations in-process. [MCP HTTP service](https://github.com/IRBorisov/ConceptPortal/blob/main/rsconcept/rstool-mcp/HTTP.md)
