import { describe, expect, it } from "vitest";
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { CallToolResultSchema } from '@modelcontextprotocol/sdk/types.js';

import { buildRSToolMcpServer } from "./server";
import { TOOL_DEFINITIONS } from "./tools";

describe("buildRSToolMcpServer", () => {
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
