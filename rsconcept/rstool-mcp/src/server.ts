import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { RSToolAgent, RSToolError } from "@rsconcept/rstool";

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
  aroundToolCall?: <T>(invoke: () => Promise<T>, definition: ToolDefinition | undefined) => Promise<T>;
  /** Tool discovery and account-management guidance for hosted clients. */
  instructions?: string;
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
      instructions: options.instructions,
    },
  );

  const definitions = [...TOOL_DEFINITIONS, ...(options.additionalTools ?? [])];
  const definitionByName = new Map<string, ToolDefinition>(definitions.map(definition => [definition.name, definition]));
  if (definitionByName.size !== definitions.length) throw new Error('Duplicate MCP tool name');
  const listMethods = definitionByName.get('list_methods');
  if (listMethods) definitionByName.set('list_methods', { ...listMethods, invoke: () => definitions.map(item => item.name) });

  server.server.setRequestHandler(ListToolsRequestSchema, () =>
    Promise.resolve({
      tools: definitions.map((definition) => ({
        name: definition.name,
        description: definition.description,
        inputSchema: definition.inputSchema,
        annotations: definition.annotations,
      })),
    }),
  );

  let invocationTail: Promise<unknown> = Promise.resolve();
  server.server.setRequestHandler(CallToolRequestSchema, (request, extra) => {
    /** Adapt one rstool invocation, preserving tool errors as MCP error results. */
    const invoke = async () => {
      const definition = definitionByName.get(request.params.name);
      if (!definition) return errorResult({ code: 'UNKNOWN_TOOL', message: `Unknown rstool tool: ${request.params.name}` });

      try {
        if (extra.signal.aborted) throw new Error('Request cancelled before tool execution');
        const result = await definition.invoke(
          tool,
          request.params.arguments ?? {},
        );
        return successResult(result);
      } catch (error) {
        return failureResult(error, definition.name, options.sanitizeStorageErrors);
      }
    };
    const guarded = async () => {
      try { return await (options.aroundToolCall ? options.aroundToolCall(invoke, definitionByName.get(request.params.name)) : invoke()); }
      catch (error) {
        return failureResult(error, request.params.name, options.sanitizeStorageErrors);
      }
    };
    if (options.serializeToolCalls === false) return guarded();
    const invocation = invocationTail.then(guarded);
    invocationTail = invocation.catch(() => undefined);
    return invocation;
  });

  return server;
}

/** Preserve text compatibility while exposing object results directly to MCP clients. */
function successResult(result: unknown) {
  return { content: [{ type: 'text' as const,
    text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }],
    ...(result !== null && typeof result === 'object' && !Array.isArray(result)
      ? { structuredContent: result as Record<string, unknown> } : {}) };
}

function errorResult(error: Record<string, unknown>, text = JSON.stringify({ error })) {
  return { isError: true, structuredContent: { error }, content: [{ type: 'text' as const, text }] };
}

/** One error boundary for direct tool failures and trusted host invocation guards. */
function failureResult(error: unknown, name: string, sanitizeStorageErrors = false) {
  const storage = storageFailure(error, sanitizeStorageErrors);
  if (storage) return errorResult(storage);
  if (error instanceof RSToolError) return errorResult({ code: error.code, tool: name, message: error.message });
  const message = error instanceof Error ? error.message : String(error);
  return errorResult({ code: 'TOOL_EXECUTION_FAILED', tool: name, message }, `rstool error in ${name}: ${message}`);
}

/** Classify only known filesystem failures and serialize an explicit numeric details allow-list. */
function storageFailure(error: unknown, classifyFilesystem = false): Record<string, unknown> | undefined {
  const storage = error instanceof SessionStorageError ? error : classifyFilesystem && filesystemFailure(error)
    ? new SessionStorageError('SESSION_STORAGE_UNAVAILABLE', 'Session storage operation failed. Contact the administrator.') : undefined;
  if (!storage) return undefined;
  const result: Record<string, unknown> = { code: storage.code, message: storage.message };
  if (storage.code === 'SESSION_LIMIT_REACHED') result.recovery = {
    configTool: 'get_session_storage_config', listTool: 'list_stored_sessions', deleteTool: 'delete_stored_session',
    automaticEviction: false, instruction: 'Reuse a session or inspect the list and explicitly delete an unneeded session. Deletion is destructive.'
  };
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
    'EEXIST', 'EBUSY', 'ENOTDIR', 'EISDIR', 'ENAMETOOLONG', 'EFBIG', 'EINVAL', 'ELOOP', 'EXDEV'].includes(code)) return true;
  const system = error as NodeJS.ErrnoException & { dest?: unknown };
  if (code && /^E[A-Z0-9_]+$/.test(code) && (typeof system.path === 'string' || typeof system.dest === 'string' ||
    (typeof system.syscall === 'string' && /^(open|stat|lstat|fstat|rename|read|write|unlink|mkdir|rmdir|scandir|copyfile|realpath|fsync|fdatasync|ftruncate)/.test(system.syscall)))) return true;
  return error instanceof AggregateError && error.errors.some(item => filesystemFailure(item, depth + 1));
}
