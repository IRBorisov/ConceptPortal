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
  /** Hosted storage errors must never expose raw I/O paths to authenticated clients. */
  sanitizeStorageErrors?: boolean;
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
        const failure = storageFailure(error, options.sanitizeStorageErrors);
        if (failure) {
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
    const guarded = async () => {
      try { return await (options.aroundToolCall ? options.aroundToolCall(invoke) : invoke()); }
      catch (error) {
        const failure = storageFailure(error, options.sanitizeStorageErrors);
        if (!failure) throw error;
        return { isError: true, structuredContent: { error: failure },
          content: [{ type: "text" as const, text: JSON.stringify({ error: failure }) }] };
      }
    };
    if (options.serializeToolCalls === false) return guarded();
    const invocation = invocationTail.then(guarded);
    invocationTail = invocation.catch(() => undefined);
    return invocation;
  });

  return server;
}

/** Classify only known filesystem failures and serialize an explicit numeric details allow-list. */
function storageFailure(error: unknown, classifyFilesystem = false): Record<string, string | number> | undefined {
  const storage = error instanceof SessionStorageError ? error : classifyFilesystem && filesystemFailure(error)
    ? new SessionStorageError('SESSION_STORAGE_UNAVAILABLE', 'Session storage operation failed. Contact the administrator.') : undefined;
  if (!storage) return undefined;
  const result: Record<string, string | number> = { code: storage.code, message: storage.message };
  for (const key of ['limit', 'count', 'retryAfterSeconds', 'retentionSeconds']) {
    const value = storage.details[key];
    if (typeof value === 'number' && Number.isFinite(value) && value >= 0) result[key] = value;
  }
  return result;
}

/** Persistence can aggregate an original I/O failure with a failed cleanup or rollback. */
function filesystemFailure(error: unknown, depth = 0): boolean {
  if (!error || typeof error !== 'object' || depth > 4) return false;
  const code = (error as NodeJS.ErrnoException).code;
  if (code && ['EACCES', 'EPERM', 'ENOENT', 'ENOSPC', 'EIO', 'EROFS', 'EMFILE', 'ENFILE', 'EDQUOT',
    'EEXIST', 'EBUSY', 'ENOTDIR', 'EISDIR'].includes(code)) return true;
  return error instanceof AggregateError && error.errors.some(item => filesystemFailure(item, depth + 1));
}
