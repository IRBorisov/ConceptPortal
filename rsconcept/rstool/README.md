# @rsconcept/rstool

Agent-facing library for **incremental RSForm construction**, **RSLang expression analysis**, **diagnostics**, **modeling**, and **evaluation**. It wraps [`@rsconcept/domain`](https://www.npmjs.com/package/@rsconcept/domain) with a deterministic session contract and a stdio JSON wrapper for LLM agents. MCP hosts can use it through [`@rsconcept/rstool-mcp`](https://www.npmjs.com/package/@rsconcept/rstool-mcp).

**Contract version:** `2.0.0` — see [skills/rstool-helper/REFERENCE.md](./skills/rstool-helper/REFERENCE.md) for the full v2 API.

## Agent skill

RS language + rstool workflows for agents: `skills/rstool-helper/` (`GUIDE.md`, `REFERENCE.md`, `EXAMPLES.md`) and `docs/` (`DOMAIN.md`, `CONCEPTUAL-SCHEMA.md`, `SYNTAX.md`, …). A **thin** entry skill is installed into the project’s agent skills folder; see [Installing the agent skill](#installing-the-agent-skill) below.

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

That copies `skills/rstool-helper/SKILL.md` from the package into your host’s project skills directory (for example `.agents/skills/rstool-helper/SKILL.md`). Full guidance stays in the package (`skills/rstool-helper/GUIDE.md`, `docs/*.md`) and is read from `node_modules` when needed.

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

// Default is for checkout/dev use: `npm run wrapper` in the current cwd.
// For an installed package, pass { command: 'npx', args: ['rstool-wrapper'] }.
const client = new RSToolWrapperClient();
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

## Repo scripts

From `rsconcept/rstool` (or run `powershell -File scripts/dev/LocalDevSetup.ps1` from the repo root on Windows):

- `npm install` / `npm ci`
- `npm run typecheck`
- `npm test`
- `npm run build` — produce `dist/` via tsdown
- `npm run wrapper` — dev stdio wrapper via `tsx`
- `npm run example:client`, `npm run example:build-schema`, `npm run example:build-rsmodel` — полный список `example:*` и `kinship:cli` в [`examples/README.md`](examples/README.md)

## Stdio protocol

- Input: one JSON request per line.
- Output: one JSON response per line.
- The wrapper keeps state in memory while the process is alive (or on disk when `RSTOOL_PERSISTENCE_DIR` is set).
- If a session method is called without an active session, rstool creates one lazily.
- On startup, a ready handshake is printed.

Supported methods (contract `2.0.0`):

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

Params are **flat** at the top level (no `params.input` wrapper). Optional `sessionId` sits alongside method fields.

Example request:

```json
{ "id": "1", "method": "createSession", "params": {} }
```

Example schema patch:

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

Example response:

```json
{ "id": "1", "ok": true, "result": { "sessionId": "...", "contractVersion": "2.0.0" } }
```

## Typed client example

Run:

```bash
npm run example:client
```

File: [`examples/agent-client.ts`](examples/agent-client.ts)

## License

MIT
