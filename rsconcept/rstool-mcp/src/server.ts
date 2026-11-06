import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { RSToolAgent } from "@rsconcept/rstool";

import { TOOL_DEFINITIONS, type ToolDefinition } from "./tools";
import { SessionStorageError } from "./session-policy";

export interface BuildRSToolMcpServerOptions {
  /** Pre-built RSToolAgent. Defaults to a fresh in-memory instance. */
  tool?: RSToolAgent;
  /** Persist sessions to this directory (also reads RSTOOL_PERSISTENCE_DIR when set). */
  persistenceDir?: string;
  /** Server name advertised to MCP clients. */
  name?: string;
  /** Server version advertised to MCP clients. */
  version?: string;
  /** Queue tool invocations, including calls in one JSON-RPC batch. Defaults to true. */
  serializeToolCalls?: boolean;
  /** Trusted host integration tools, already bound to its authenticated identity. */
  additionalTools?: readonly ToolDefinition[];
  /** Trusted host invocation guard, run inside the per-workspace serial queue. */
  aroundToolCall?: <T>(invoke: () => Promise<T>) => Promise<T>;
}

/**
 * Build an MCP `McpServer` instance that exposes the `@rsconcept/rstool` contract.
 *
 * The returned server is not yet connected to a transport. Wrap it with a
 * `StdioServerTransport` (for local subprocess hosts like Cursor and Claude Desktop) or
 * an HTTP transport, then call `server.connect(transport)`.
 *
 * @example
 * ```ts
 * import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
 * import { buildRSToolMcpServer } from '@rsconcept/rstool-mcp';
 *
 * const server = buildRSToolMcpServer();
 * await server.connect(new StdioServerTransport());
 * ```
 */
export function buildRSToolMcpServer(
  options: BuildRSToolMcpServerOptions = {},
): McpServer {
  const persistenceDir =
    options.persistenceDir ?? process.env.RSTOOL_PERSISTENCE_DIR;
  const tool =
    options.tool ??
    new RSToolAgent(persistenceDir ? { persistenceDir } : undefined);
  const server = new McpServer(
    {
      name: options.name ?? "rstool-mcp",
      version: options.version ?? "2.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  const definitions = [...TOOL_DEFINITIONS, ...(options.additionalTools ?? [])];
  const definitionByName = new Map<string, ToolDefinition>(definitions.map(definition => [definition.name, definition]));
  if (definitionByName.size !== definitions.length) throw new Error('Duplicate MCP tool name');

  server.server.setRequestHandler(ListToolsRequestSchema, () =>
    Promise.resolve({
      tools: definitions.map((definition) => ({
        name: definition.name,
        description: definition.description,
        inputSchema: definition.inputSchema,
      })),
    }),
  );

  let invocationTail: Promise<unknown> = Promise.resolve();
  server.server.setRequestHandler(CallToolRequestSchema, (request, extra) => {
    /** Adapt one rstool invocation, preserving tool errors as MCP error results. */
    const invoke = async () => {
      const definition = definitionByName.get(request.params.name);
      if (!definition) {
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: `Unknown rstool tool: ${request.params.name}`,
            },
          ],
        };
      }

      try {
        if (extra.signal.aborted) throw new Error('Request cancelled before tool execution');
        const result = await definition.invoke(
          tool,
          request.params.arguments ?? {},
        );
        const text =
          typeof result === "string" ? result : JSON.stringify(result, null, 2);
        return {
          content: [
            {
              type: "text" as const,
              text,
            },
          ],
        };
      } catch (error) {
        if (error instanceof SessionStorageError) {
          const failure = { code: error.code, message: error.message, ...error.details };
          return { isError: true, structuredContent: { error: failure },
            content: [{ type: "text" as const, text: JSON.stringify({ error: failure }) }] };
        }
        const message = error instanceof Error ? error.message : String(error);
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: `rstool error in ${definition.name}: ${message}`,
            },
          ],
        };
      }
    };
    const guarded = () => options.aroundToolCall ? options.aroundToolCall(invoke) : invoke();
    if (options.serializeToolCalls === false) return guarded();
    const invocation = invocationTail.then(guarded);
    invocationTail = invocation.catch(() => undefined);
    return invocation;
  });

  return server;
}
