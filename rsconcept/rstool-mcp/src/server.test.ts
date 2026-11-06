import { describe, expect, it, vi } from "vitest";
import { RSToolAgent } from '@rsconcept/rstool';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { CallToolResultSchema } from '@modelcontextprotocol/sdk/types.js';

import { buildRSToolMcpServer } from "./server";
import { TOOL_DEFINITIONS } from "./tools";

describe("buildRSToolMcpServer", () => {
  it.each(['ENAMETOOLONG', 'EFBIG', 'EINVAL', 'EUNLISTED_FS'])('sanitizes hosted filesystem code %s, including aggregated failures', async code => {
    const tool = new RSToolAgent();
    const failure = Object.assign(new Error('Synthetic private path /private-state/model.json'),
      { code, syscall: 'open', path: '/private-state/model.json' });
    const create = vi.spyOn(tool, 'createSession').mockImplementation(() => {
      throw new AggregateError([failure], 'Rollback at /private-state/model.json');
    });
    const server = buildRSToolMcpServer({ tool, sanitizeStorageErrors: true });
    const client = new Client({ name: 'storage-error-test', version: '1' });
    const [local, remote] = InMemoryTransport.createLinkedPair();
    try {
      await server.connect(remote);
      await client.connect(local);
      const result = await client.callTool({ name: 'create_session', arguments: {} });
      expect(result.structuredContent).toMatchObject({ error: { code: 'SESSION_STORAGE_UNAVAILABLE' } });
      expect(JSON.stringify(result)).not.toContain('/private-state');
    } finally { create.mockRestore(); await client.close(); await server.close(); }
  });

  it('skips a cancelled mutation queued behind another request and continues serving calls', async () => {
    const tool = new RSToolAgent();
    let release!: () => void;
    let entered!: () => void;
    const started = new Promise<void>(resolve => { entered = resolve; });
    const gate = new Promise<void>(resolve => { release = resolve; });
    const model = vi.spyOn(tool, 'setModelValues').mockImplementationOnce(async () => {
      entered();
      await gate;
      return { items: [] };
    });
    const create = vi.spyOn(tool, 'createSession');
    const server = buildRSToolMcpServer({ tool });
    const client = new Client({ name: 'cancel-queue-test', version: '1' });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    let delivered!: () => void;
    const cancellationDelivered = new Promise<void>(resolve => { delivered = resolve; });
    const send = clientTransport.send.bind(clientTransport);
    const transportSend = vi.spyOn(clientTransport, 'send').mockImplementation(async (message, options) => {
      await send(message, options);
      if ('method' in message && message.method === 'notifications/cancelled') delivered();
    });
    try {
      await server.connect(serverTransport);
      await client.connect(clientTransport);
      const first = client.callTool({ name: 'set_model_values', arguments: {} });
      await started;
      const controller = new AbortController();
      const cancelled = client.callTool({ name: 'create_session', arguments: {} }, undefined, { signal: controller.signal });
      const rejection = expect(cancelled).rejects.toThrow();
      controller.abort();
      await rejection;
      await cancellationDelivered;
      release();
      await first;
      await client.callTool({ name: 'get_current_session', arguments: {} });
      expect(create).not.toHaveBeenCalled();
      expect(tool.getCurrentSession()).toBeNull();
    } finally {
      release();
      await client.close();
      await server.close();
      model.mockRestore();
      create.mockRestore();
      transportSend.mockRestore();
    }
  });

  it('serializes model writes and schema edits by default for stdio and other transports', async () => {
    const server = buildRSToolMcpServer();
    const client = new Client({ name: 'default-queue-test', version: '1' });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    try {
      await server.connect(serverTransport);
      await client.connect(clientTransport);
      await client.callTool({ name: 'apply_schema_patch', arguments: { items: [{ alias: 'X1' }] } });
      const [model, patch] = await Promise.all([
        client.callTool({ name: 'set_model_values', arguments: { set: [{ target: 1, value: { 0: 'one' } }] } }),
        client.callTool({ name: 'apply_schema_patch', arguments: { items: [{ alias: 'X2' }] } }),
      ]);
      expect(model.isError).not.toBe(true);
      expect(patch.isError).not.toBe(true);
      const state = CallToolResultSchema.parse(await client.callTool({ name: 'get_session_state', arguments: {} }));
      const content = state.content[0];
      if (content.type !== 'text') throw new Error('Expected text result');
      expect(JSON.parse(content.text)).toMatchObject({ itemCount: 2, modelItemCount: 1 });
    } finally {
      await client.close();
      await server.close();
    }
  });
  it("exposes the rstool v2 contract as MCP tools", () => {
    const server = buildRSToolMcpServer();
    expect(server).toBeDefined();
    expect(TOOL_DEFINITIONS.map((t) => t.name)).toEqual([
      "ping",
      "list_methods",
      "ensure_session",
      "create_session",
      "set_current_session",
      "get_current_session",
      "apply_schema_patch",
      "get_session_state",
      "analyze_expression",
      "list_diagnostics",
      "commit_step",
      "export_session",
      "export_portal",
      "import_data",
      "set_model_values",
      "get_model_state",
      "evaluate",
      "recalculate_model",
      "restore_order",
      "synthesize",
    ]);
  });

  it("list_diagnostics forwards flat kind and severity filters", () => {
    const definition = TOOL_DEFINITIONS.find((t) => t.name === "list_diagnostics")!;
    const calls: unknown[][] = [];
    const tool = {
      listDiagnostics: (...args: unknown[]) => {
        calls.push(args);
        return [];
      },
    };
    definition.invoke(tool as never, { kind: "schema", severity: "warning", sessionId: "s1" });
    expect(calls[0]).toEqual([{ kind: "schema", severity: "warning" }, "s1"]);
    definition.invoke(tool as never, {});
    expect(calls[1]).toEqual([undefined, undefined]);
  });

  it("each tool has a permissive but well-formed input schema", () => {
    for (const definition of TOOL_DEFINITIONS) {
      expect(definition.inputSchema.type).toBe("object");
      expect(typeof definition.description).toBe("string");
      expect(definition.description.length).toBeGreaterThan(0);
    }
  });
});


it('exposes actionable empty-session errors and structured model results', async () => {
  const tool = new RSToolAgent();
  const server = buildRSToolMcpServer({ tool });
  const client = new Client({ name: 'agent-contract-test', version: '1' });
  const [local, remote] = InMemoryTransport.createLinkedPair();
  try {
    await server.connect(remote); await client.connect(local);
    const empty = await client.callTool({ name: 'get_session_state', arguments: {} });
    expect(empty.structuredContent).toMatchObject({ error: { code: 'NO_CURRENT_SESSION' } });
    expect(tool.getCurrentSession()).toBeNull();
    const missing = await client.callTool({ name: 'set_current_session', arguments: { sessionId: 'missing' } });
    expect(missing.structuredContent).toMatchObject({ error: { code: 'SESSION_NOT_FOUND' } });
    await client.callTool({ name: 'apply_schema_patch', arguments: { items: [{ alias: 'X1', convention: 'Test elements' }] } });
    const invalid = await client.callTool({ name: 'set_model_values', arguments: { set: [{ target: 1, value: ['one'] }] } });
    expect(invalid.structuredContent).toMatchObject({ error: { code: 'TOOL_EXECUTION_FAILED', message: expect.stringContaining('object mapping integer element ids') } });
    const valid = await client.callTool({ name: 'set_model_values', arguments: { set: [{ target: 1, value: { 0: 'one' } }] } });
    expect(valid.isError).not.toBe(true);
    const result = CallToolResultSchema.parse(await client.callTool({ name: 'evaluate', arguments: { expression: '1+2', cstType: 'term' } }));
    expect(result.structuredContent).toMatchObject({ success: true, value: 3, statusName: 'HAS_DATA' });
    const text = result.content[0] as { type: string; text: string };
    expect(JSON.parse(text.text)).toEqual(result.structuredContent);
  } finally { await client.close(); await server.close(); }
});
