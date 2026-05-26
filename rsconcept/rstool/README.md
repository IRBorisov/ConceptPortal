# @rsconcept/rstool

Agent-facing library for **incremental RSForm construction**, **RSLang expression analysis**, **diagnostics**, **modeling**, and **evaluation**. It wraps [`@rsconcept/domain`](https://www.npmjs.com/package/@rsconcept/domain) with a deterministic session contract and a stdio JSON wrapper that LLM agents and Cursor/Claude clients can call directly.

## Agent skill

RS language + rstool workflows for agents: `skills/rstool-helper/` (`SKILL.md`, `REFERENCE.md`, `EXAMPLES.md`). The companion language reference in `docs/` (`DOMAIN.md`, `SYNTAX.md`, `TYPIFICATION.md`, `CONSTITUENTA.md`, `DIAGNOSTICS.md`, `PORTAL-API.md`, `GRAMMAR-REF.md`) is distilled from the Portal manuals and ships with the npm package, so standalone agents never need to read the Portal frontend source.

## Install

```bash
npm install @rsconcept/rstool
```

`@rsconcept/domain` is a peer-of-dependency installed automatically. No Portal checkout is required.

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
- Library API + stdio JSON wrapper as the only supported transports (MCP adapter lives in [`@rsconcept/rstool-mcp`](../rstool-mcp/)).

## Repo scripts

This package is part of the [Concept Portal](https://github.com/IRBorisov/ConceptPortal) npm workspaces. From the repo root:

- `npm install` — install all workspaces (`@rsconcept/domain`, `frontend`, `@rsconcept/rstool`)
- `npm run typecheck -w @rsconcept/rstool`
- `npm test -w @rsconcept/rstool`
- `npm run build -w @rsconcept/rstool` — produce `dist/` via tsdown
- `npm run wrapper -w @rsconcept/rstool` — dev stdio wrapper via `tsx`
- `npm run example:client -w @rsconcept/rstool`, `npm run example:build-schema -w @rsconcept/rstool`, `npm run example:build-rsmodel -w @rsconcept/rstool`

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
{ "id": "1", "ok": true, "result": { "sessionId": "...", "contractVersion": "1.2.0" } }
```

## Typed client example

Run:

```bash
npm run example:client -w @rsconcept/rstool
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

## Installing the skill into an agent host

The package ships the skill files in `skills/rstool-helper/`. After install, copy or symlink them into your agent host's skill directory:

```bash
# Cursor (per-project skills)
mkdir -p .agents/skills
cp -r node_modules/@rsconcept/rstool/skills/rstool-helper .agents/skills/rstool-helper
cp -r node_modules/@rsconcept/rstool/docs .agents/skills/rstool-helper/docs

# Claude Code or other hosts: consult host-specific docs
```

PowerShell:

```powershell
New-Item -ItemType Directory -Force .agents/skills
Copy-Item -Recurse -Force node_modules/@rsconcept/rstool/skills/rstool-helper .agents/skills/rstool-helper
Copy-Item -Recurse -Force node_modules/@rsconcept/rstool/docs .agents/skills/rstool-helper/docs
```

The skill defers to the bundled `docs/*.md` for language reference. Copying both the skill and docs makes the installed agent skill self-contained.

## License

MIT
