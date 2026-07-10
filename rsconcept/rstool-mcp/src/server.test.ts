import { describe, expect, it } from "vitest";

import { buildRSToolMcpServer } from "./server";
import { TOOL_DEFINITIONS } from "./tools";

describe("buildRSToolMcpServer", () => {
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
    ]);
  });

  it("each tool has a permissive but well-formed input schema", () => {
    for (const definition of TOOL_DEFINITIONS) {
      expect(definition.inputSchema.type).toBe("object");
      expect(typeof definition.description).toBe("string");
      expect(definition.description.length).toBeGreaterThan(0);
    }
  });
});
