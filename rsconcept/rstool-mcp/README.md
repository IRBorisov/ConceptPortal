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
      "args": ["-y", "@rsconcept/rstool-mcp@0.1.0"]
    }
  }
}
```

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

| MCP tool | Wraps | Notes |
|----------|-------|-------|
| `ping` | — | Liveness + `contractVersion`. |
| `list_methods` | — | Enumerate available tools. |
| `create_session` | `RSToolAgent.createSession` | Optional `initial` seed. |
| `add_or_update_constituenta` | `addOrUpdateConstituenta` | Single upsert. |
| `analyze_expression` | `analyzeExpression` | Parser + semantic. |
| `get_form_state` | `getFormState` | Current `SessionState`. |
| `list_diagnostics` | `listDiagnostics` | Filterable. |
| `commit_step` | `commitStep` | Records a `SessionRevision`. |
| `export_session` | `exportSession` | JSON string. |
| `import_session` | `importSession` | Restore from JSON. |
| `set_constituenta_value` | `setConstituentaValue` | Bind interpretable. |
| `set_constituenta_values` | `setConstituentaValues` | Batch bindings. |
| `clear_constituenta_values` | `clearConstituentaValues` | Reset values. |
| `get_model_state` | `getModelState` | Values + statuses. |
| `evaluate_expression` | `evaluateExpression` | Scratch evaluation. |
| `evaluate_constituenta` | `evaluateConstituenta` | Stored derived constituent. |
| `recalculate_model` | `recalculateModel` | Full recompute. |

Input schemas are intentionally permissive (`additionalProperties: true`) where the rstool input is structurally rich (e.g. `ConstituentaDraft`, `SessionState`); the wrapped `RSToolAgent` validates inputs at runtime and returns deterministic error responses, surfaced through `isError: true` on the MCP response.

## Programmatic use

If you want to build a custom transport (HTTP, in-process) instead of stdio:

```ts
import { StreamableHttpServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { buildRSToolMcpServer } from '@rsconcept/rstool-mcp';

const server = buildRSToolMcpServer();
const transport = new StreamableHttpServerTransport();
await server.connect(transport);
```

Or share a single `RSToolAgent` between multiple servers / requests:

```ts
import { RSToolAgent } from '@rsconcept/rstool';
import { buildRSToolMcpServer } from '@rsconcept/rstool-mcp';

const tool = new RSToolAgent();
const server = buildRSToolMcpServer({ tool, name: 'my-rstool-mcp', version: '0.2.0' });
```

## Companion docs

For RS language, the rstool contract, error codes, and common workflows, agents should read [`@rsconcept/rstool/docs`](https://www.npmjs.com/package/@rsconcept/rstool#agent-skill) and the bundled `rstool-helper` skill that ships with `@rsconcept/rstool`.

## Publishing

Maintainers: see [PUBLISHING.md](./PUBLISHING.md) for npm release steps.

## License

MIT
