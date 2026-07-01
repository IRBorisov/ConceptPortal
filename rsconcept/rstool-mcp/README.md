# @rsconcept/rstool-mcp

[Model Context Protocol](https://modelcontextprotocol.io/) adapter for [`@rsconcept/rstool`](https://www.npmjs.com/package/@rsconcept/rstool). Exposes the full `RSToolAgent` contract — sessions, constituent upserts, RSLang analysis, diagnostics, modeling, evaluation — as MCP **tools** over stdio, so any MCP-capable host (Cursor, Claude Desktop, your own client) can drive rstool natively.

If you do not need MCP, use `@rsconcept/rstool` directly (library API or stdio JSON wrapper).

## Install

```bash
npm install -g @rsconcept/rstool-mcp
# or per-project:
npm install @rsconcept/rstool-mcp
```

The package ships a `rstool-mcp` bin that launches the stdio server. It depends on `@rsconcept/rstool` and (transitively) `@rsconcept/domain`; no Portal checkout is required.

## Run

```bash
npx rstool-mcp
```

The server announces readiness on stderr (`rstool-mcp server ready on stdio`) and then speaks the MCP protocol on stdin/stdout. There is no HTTP port.

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

| MCP tool              | Wraps               | Notes                                        |
| --------------------- | ------------------- | -------------------------------------------- |
| `ping`                | —                   | Liveness + `contractVersion`.                |
| `list_methods`        | —                   | Enumerate available tools.                   |
| `ensure_session`      | `ensureSession`     | Return active session or create one.         |
| `create_session`      | `createSession`     | Optional `initial` seed.                     |
| `set_current_session` | `setCurrentSession` | Switch active session.                       |
| `get_current_session` | `getCurrentSession` | Current session handle, or `null`.           |
| `apply_schema_patch`  | `applySchemaPatch`  | Primary schema edit path.                    |
| `get_session_state`   | `getSessionState`   | `detail=summary` (default) or `full`.        |
| `analyze_expression`  | `analyzeExpression` | Scratch analysis.                            |
| `list_diagnostics`    | `listDiagnostics`   | Optional `constituentId`.                    |
| `commit_step`         | `commitStep`        | Records a revision.                          |
| `export_session`      | `exportSession`     | JSON string.                                 |
| `export_portal`       | `exportPortal`      | `kind=schema\|model`, `format=json\|object`. |
| `import_data`         | `importData`        | `kind=auto` by default.                      |
| `set_model_values`    | `setModelValues`    | `set[]` and/or `clear[]`.                    |
| `get_model_state`     | `getModelState`     | Values + statuses.                           |
| `evaluate`            | `evaluate`          | Scratch or stored constituent.               |
| `recalculate_model`   | `recalculateModel`  | Full recompute.                              |

Session tools accept optional `sessionId` (flat params, no `input` wrapper). Prefer `apply_schema_patch` for schema edits.

## Programmatic use

If you want to build a custom transport (HTTP, in-process) instead of stdio:

```ts
import { StreamableHttpServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { buildRSToolMcpServer } from "@rsconcept/rstool-mcp";

const server = buildRSToolMcpServer();
const transport = new StreamableHttpServerTransport();
await server.connect(transport);
```

Or share a single `RSToolAgent` between multiple servers / requests:

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

For RS language, the rstool contract, error codes, and common workflows, agents should read [`@rsconcept/rstool/docs`](https://www.npmjs.com/package/@rsconcept/rstool#agent-skill) and the bundled `rstool-helper` skill that ships with `@rsconcept/rstool`.

## Publishing

Maintainers: see [PUBLISHING.md](./PUBLISHING.md) for npm release steps.

## License

MIT
