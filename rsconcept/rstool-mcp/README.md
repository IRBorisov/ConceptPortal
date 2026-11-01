# @rsconcept/rstool-mcp

[Model Context Protocol](https://modelcontextprotocol.io/) adapter for [`@rsconcept/rstool`](https://www.npmjs.com/package/@rsconcept/rstool). Exposes sessions, schema editing, RSLang analysis, diagnostics, modeling and evaluation as MCP tools over local stdio or authenticated Streamable HTTP.

If you do not need MCP, use `@rsconcept/rstool` directly (library API or stdio JSON wrapper).

## Install

```bash
npm install -g @rsconcept/rstool-mcp
# or per-project:
npm install @rsconcept/rstool-mcp
```

The package ships `rstool-mcp` for stdio and `rstool-mcp-http` for a hosted service. It depends on `@rsconcept/rstool` and (transitively) `@rsconcept/domain`; no Portal checkout is required.

## Run

```bash
npx rstool-mcp
```

The stdio server announces readiness on stderr (`rstool-mcp server ready on stdio`) and speaks MCP on stdin/stdout. This default does not open a network port.

For a shared service, see [Streamable HTTP](HTTP.md). That mode requires bearer authentication and a persistence directory, isolates each identity/task workspace, and binds to loopback by default. Clients use a URL such as `https://mcp.example.com/mcp/my-task` and an `Authorization: Bearer` header. The existing tool names and arguments are unchanged.

## Configure in Cursor

Add the server to your Cursor MCP configuration (`~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "rstool": {
      "command": "npx",
      "args": ["-y", "@rsconcept/rstool-mcp"]
    }
  }
}
```

Restart Cursor; the tools appear under the **rstool** server. Pin a version if you prefer reproducible installs:

```json
{
  "mcpServers": {
    "rstool": {
      "command": "npx",
      "args": ["-y", "@rsconcept/rstool-mcp@0.3.0"],
      "env": {
        "RSTOOL_PERSISTENCE_DIR": "C:/path/to/rstool-sessions"
      }
    }
  }
}
```

Set `RSTOOL_PERSISTENCE_DIR` to keep sessions across MCP server restarts (optional).

## Configure in Claude Desktop

Edit `claude_desktop_config.json` (`~/Library/Application Support/Claude/` on macOS, `%APPDATA%\Claude\` on Windows):

```json
{
  "mcpServers": {
    "rstool": {
      "command": "npx",
      "args": ["-y", "@rsconcept/rstool-mcp"]
    }
  }
}
```

## Exposed tools

| MCP tool              | Wraps               | Notes                                         |
| --------------------- | ------------------- | --------------------------------------------- |
| `ping`                | —                   | Liveness + `contractVersion`.                 |
| `list_methods`        | —                   | Enumerate available tools.                    |
| `ensure_session`      | `ensureSession`     | Return active session or create one.          |
| `create_session`      | `createSession`     | Optional `initial` seed.                      |
| `set_current_session` | `setCurrentSession` | Switch active session.                        |
| `get_current_session` | `getCurrentSession` | Current session handle, or `null`.            |
| `apply_schema_patch`  | `applySchemaPatch`  | Primary schema edit path.                     |
| `get_session_state`   | `getSessionState`   | `detail=summary` (default) or `full`.         |
| `analyze_expression`  | `analyzeExpression` | Scratch analysis.                             |
| `list_diagnostics`    | `listDiagnostics`   | Optional `constituentId`, `kind`, `severity`. |
| `commit_step`         | `commitStep`        | Records a revision.                           |
| `export_session`      | `exportSession`     | JSON string.                                  |
| `export_portal`       | `exportPortal`      | `kind=schema\|model`, `format=json\|object`.  |
| `import_data`         | `importData`        | `kind=auto` by default.                       |
| `set_model_values`    | `setModelValues`    | `set[]` and/or `clear[]`.                     |
| `get_model_state`     | `getModelState`     | Values + statuses.                            |
| `evaluate`            | `evaluate`          | Scratch or stored constituent.                |
| `recalculate_model`   | `recalculateModel`  | Full recompute.                               |
| `restore_order`       | `restoreOrder`      | Restore declaration order (topo + semantic).  |
| `synthesize`          | `synthesize`        | Embed another session + identification table. |

Session tools accept optional `sessionId` (flat params, no `input` wrapper). Prefer `apply_schema_patch` for schema edits.

## Programmatic use

For a hosted HTTP service with a trusted identity verifier:

```ts
import { createRSToolHttpServer } from '@rsconcept/rstool-mcp';

const service = createRSToolHttpServer({
  persistenceDir: '/var/lib/rstool',
  verifyToken: async token => verifyYourCredential(token), // stable subject or null
  allowedHosts: ['mcp.example.com', '127.0.0.1'],
});
service.server.listen(8093, '127.0.0.1');
// On shutdown: await service.close();
```

`verifyYourCredential` is supplied by your application. The packaged CLI instead reads a protected credentials file. See [HTTP.md](HTTP.md) for the single-process ownership model and limits.

For a custom single-client transport:

```ts
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { buildRSToolMcpServer } from "@rsconcept/rstool-mcp";

const server = buildRSToolMcpServer();
const transport = new StreamableHTTPServerTransport();
await server.connect(transport);
```

For a single trusted client, you can supply its own `RSToolAgent`. Do not share this mutable instance across users or independently active workspaces:

```ts
import { RSToolAgent } from "@rsconcept/rstool";
import { buildRSToolMcpServer } from "@rsconcept/rstool-mcp";

const tool = new RSToolAgent();
const server = buildRSToolMcpServer({
  tool,
  name: "my-rstool-mcp",
  version: "0.3.0",
});
```

## Companion docs

For RS language, the rstool contract, error codes, and common workflows, agents should read [`@rsconcept/rstool/docs`](https://www.npmjs.com/package/@rsconcept/rstool#agent-skill) and the bundled `rstool` skill (router to stage skills) that ships with `@rsconcept/rstool` (install: `node_modules/@rsconcept/rstool/skills/INSTALL.md`).

## Publishing

Maintainers: see [PUBLISHING.md](./PUBLISHING.md) for npm release steps.

## License

MIT
