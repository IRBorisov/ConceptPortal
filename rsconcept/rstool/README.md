# RSForm Agent Tool

Library-first implementation for LLM agents that incrementally build RSForm and validate expressions using existing frontend RSLang domain code.

## Agent skill

RS language + rstool workflows for agents: `skills/rslang-rstool/` (`SKILL.md`, `REFERENCE.md`, `EXAMPLES.md`). Install into Cursor via `skills/README.md` (copy to `.agents/skills/rslang-rstool/`).

## Scope

- Session-based incremental editing of constituents.
- Parse/syntax/semantic/type analysis for expressions.
- Deterministic diagnostics and export/import for reproducible agent workflows.
- Transport-neutral contract with future MCP/HTTP adapter layers.

## Quick Use

```ts
import { CstType, RSFormAgentTool } from './src';

const tool = new RSFormAgentTool();
const session = tool.createSession();
const result = tool.analyzeExpression(session.sessionId, {
  expression: '1+2',
  cstType: CstType.TERM
});
```

## Scripts

- `npm run typecheck`
- `npm test`
- `npm run wrapper`
- `npm run example:client`

## Agent Wrapper (stdio)

Run:

`npm run wrapper`

Protocol:

- input: one JSON request per line
- output: one JSON response per line
- wrapper keeps state in memory while process is alive

Supported methods:

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

Example request:

```json
{"id":"1","method":"createSession","params":{}}
```

Example response:

```json
{"id":"1","ok":true,"result":{"sessionId":"...","contractVersion":"1.0.0"}}
```

## Typed client example

Run:

`npm run example:client`

File:

- `examples/agent-client.ts`

What it demonstrates:

- starts the stdio wrapper as a child process
- waits for ready handshake
- creates a session
- upserts a constituent
- runs expression analysis
- fetches diagnostics

## Importable wrapper client

You can import the wrapper client and use it in your own agent code:

```ts
import { RSToolWrapperClient } from '@rsconcept/rstool';

const client = new RSToolWrapperClient({
  cwd: 'D:/DEV/WORK/Portal/rsconcept/rstool'
});

await client.waitUntilReady();
const session = await client.call<{ sessionId: string }>('createSession');
await client.close();
```
