# @rsconcept/rstool

Agent-facing library for **incremental RSForm construction**, **RSLang expression analysis**, **diagnostics**, **modeling**, and **evaluation**. It wraps [`@rsconcept/domain`](https://www.npmjs.com/package/@rsconcept/domain) with a deterministic session contract and a stdio JSON wrapper that LLM agents and MCP clients can call directly.

## Agent skill

RS language + rstool workflows for agents: `skills/rstool-helper/` (`GUIDE.md`, `REFERENCE.md`, `EXAMPLES.md`) and `docs/` (`DOMAIN.md`, `CONCEPTUAL-SCHEMA.md`, `SYNTAX.md`, …). A **thin** entry skill is installed into the project’s agent skills folder; see [Installing the agent skill](#installing-the-agent-skill) below.

## Install

```bash
npm install @rsconcept/rstool
```

`@rsconcept/domain` is a peer-of-dependency installed automatically.

## Installing the agent skill

After `npm install @rsconcept/rstool`, **you do not copy files yourself**. Ask your agent, for example:

> Install the rstool agent skill according to the package instructions.

The agent should read and follow:

`node_modules/@rsconcept/rstool/skills/INSTALL.md`

That copies `skills/rstool-helper/SKILL.md` from the package into your host’s project skills directory (for example `.agents/skills/rstool-helper/SKILL.md`). Full guidance stays in the package (`skills/rstool-helper/GUIDE.md`, `docs/*.md`) and is read from `node_modules` when needed.

Details: `skills/README.md`.

## Quick use (library)

```ts
import { CstType, RSToolAgent } from '@rsconcept/rstool';

const tool = new RSToolAgent();
const session = tool.createSession();
const result = tool.analyzeExpression(session.sessionId, {
  expression: '1+2',
  cstType: CstType.TERM
});
```

## Quick use (stdio wrapper)

```bash
npx rstool-wrapper      # one JSON request per line on stdin, one JSON response per line on stdout
```

Or run it as a child process from your own code:

```ts
import { RSToolWrapperClient } from '@rsconcept/rstool/wrapper';

const client = new RSToolWrapperClient(); // spawns `rstool-wrapper` by default
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
- `npm run example:client`, `npm run example:build-schema`, `npm run example:build-rsmodel` — see [`examples/README.md`](examples/README.md) for the full list (kinship scripts, session JSON)

## Stdio protocol

- Input: one JSON request per line.
- Output: one JSON response per line.
- The wrapper keeps state in memory while the process is alive.
- On startup, a ready handshake is printed.

Supported methods (current contract version: see [`CONTRACT_VERSION`](src/models/tool-contract.ts)):

- `ping`
- `methods`
- `createSession`
- `addOrUpdateConstituenta`
- `analyzeExpression`
- `getFormState`
- `listDiagnostics`
- `commitStep`
- `exportSession`
- `exportPortalSchema`
- `exportPortalModel`
- `importSession`
- `setConstituentaValue`
- `setConstituentaValues`
- `clearConstituentaValues`
- `getModelState`
- `evaluateExpression`
- `evaluateConstituenta`
- `recalculateModel`

Example request:

```json
{ "id": "1", "method": "createSession", "params": {} }
```

Example response:

```json
{ "id": "1", "ok": true, "result": { "sessionId": "...", "contractVersion": "1.4.0" } }
```

## Typed client example

Run:

```bash
npm run example:client
```

File: [`examples/agent-client.ts`](examples/agent-client.ts)

The example:

- starts the stdio wrapper as a child process
- waits for the ready handshake
- creates a session
- upserts a constituent
- runs expression analysis
- sets a base binding and evaluates a term
- fetches diagnostics

## License

MIT
