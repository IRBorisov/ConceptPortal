# @rsconcept/rstool

Agent-facing library for **incremental RSForm construction**, **RSLang expression analysis**, **diagnostics**, **modeling**, and **evaluation**. It wraps [`@rsconcept/domain`](https://www.npmjs.com/package/@rsconcept/domain) with a deterministic session contract and a stdio JSON wrapper for LLM agents. MCP hosts can use it through [`@rsconcept/rstool-mcp`](https://www.npmjs.com/package/@rsconcept/rstool-mcp).

**Contract version:** `3.3.0` — see [skills/rstool-runtime/REFERENCE.md](./skills/rstool-runtime/REFERENCE.md) for the full v3 API.

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

That runs `npx rstool-skills install`, which writes a stub `rstool/SKILL.md` (name, description and a path into `node_modules`) into `.claude/skills/` and `.agents/skills/`. The skills and `docs/*.md` stay in the package and are read from `node_modules` when needed, so nothing is re-copied after an update.

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

## Publishing

Maintainers: see [PUBLISHING.md](./PUBLISHING.md) for npm release steps.

## Stdio protocol

- Input: one JSON request per line.
- Output: one JSON response per line.
- The wrapper keeps state in memory while the process is alive (or on disk when `RSTOOL_PERSISTENCE_DIR` is set).
- If a session method is called without an active session, rstool creates one lazily.
- On startup, a ready handshake is printed.

Supported methods (contract `3.3.0`):

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
{ "id": "1", "ok": true, "result": { "sessionId": "...", "contractVersion": "3.3.0" } }
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
    "session": { "sessionId": "...", "contractVersion": "3.3.0" },
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
