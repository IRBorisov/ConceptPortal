/**
 * MCP tool definitions for the @rsconcept/rstool contract.
 */

import { type RSToolAgent } from "@rsconcept/rstool";

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
    additionalProperties?: boolean;
  };
  invoke: (
    tool: RSToolAgent,
    args: Record<string, unknown>,
  ) => unknown | Promise<unknown>;
}

const sessionId = {
  type: "string",
  description: "Session id. Omit to use the current active session.",
};

const agentPatchSchema = {
  type: "object",
  description:
    "Agent-friendly constituent patch. id and cstType are optional; cstType is inferred from alias prefixes X/C/S/D/A/F/P.",
  properties: {
    id: { type: "number" },
    alias: { type: "string" },
    cstType: { type: "string" },
    definitionFormal: { type: "string" },
    term: { type: "string" },
    definitionText: { type: "string" },
    convention: { type: "string" },
  },
  required: ["alias"],
};

function optionalSessionId(args: Record<string, unknown>): string | undefined {
  const value = args.sessionId;
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function omitSessionId(args: Record<string, unknown>): Record<string, unknown> {
  const { sessionId: _sessionId, ...rest } = args;
  return rest;
}

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: "ping",
    description:
      "Liveness check; returns {pong: true} and the active rstool contract version.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    invoke: (tool) => ({ pong: true, contractVersion: tool.contractVersion }),
  },
  {
    name: "list_methods",
    description: "List all rstool methods exposed as MCP tools.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    invoke: () => TOOL_DEFINITIONS.map((definition) => definition.name),
  },
  {
    name: "ensure_session",
    description:
      "Return the current active session, or create one if none exists. Optional initial seed is used only when creating.",
    inputSchema: {
      type: "object",
      properties: {
        initial: {
          type: "object",
          properties: {
            alias: { type: "string" },
            title: { type: "string" },
            comment: { type: "string" },
          },
          additionalProperties: true,
        },
      },
      additionalProperties: false,
    },
    invoke: (tool, args) => tool.ensureSession(args.initial as never),
  },
  {
    name: "create_session",
    description:
      "Create a fresh in-memory rstool session and set it as the current active session.",
    inputSchema: {
      type: "object",
      properties: {
        initial: {
          type: "object",
          description:
            "Optional partial SessionState seed (alias, title, comment).",
          properties: {
            alias: { type: "string" },
            title: { type: "string" },
            comment: { type: "string" },
          },
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
    invoke: (tool, args) => tool.createSession(args.initial as never),
  },
  {
    name: "set_current_session",
    description: "Set the active session by id.",
    inputSchema: {
      type: "object",
      properties: { sessionId },
      required: ["sessionId"],
    },
    invoke: (tool, args) => tool.setCurrentSession(String(args.sessionId)),
  },
  {
    name: "get_current_session",
    description: "Return the current active session, or null if none exists.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    invoke: (tool) => tool.getCurrentSession(),
  },
  {
    name: "apply_schema_patch",
    description:
      "Preferred schema edit path. Batch patch with inferred ids and cstType, dependency ordering, and compact summary.",
    inputSchema: {
      type: "object",
      properties: {
        sessionId,
        initial: {
          type: "object",
          properties: {
            alias: { type: "string" },
            title: { type: "string" },
            comment: { type: "string" },
          },
          additionalProperties: true,
        },
        items: { type: "array", items: agentPatchSchema },
        mode: { type: "string", enum: ["atomic", "best_effort"] },
        commitMessage: { type: "string" },
      },
      required: ["items"],
    },
    invoke: (tool, args) =>
      tool.applySchemaPatch(
        omitSessionId(args) as never,
        optionalSessionId(args),
      ),
  },
  {
    name: "get_session_state",
    description:
      "Return session state. detail=summary (default): compact metadata, aliases, diagnostics. detail=full: complete SessionState clone.",
    inputSchema: {
      type: "object",
      properties: {
        sessionId,
        detail: { type: "string", enum: ["summary", "full"] },
      },
    },
    invoke: (tool, args) =>
      tool.getSessionState(
        (args.detail as "summary" | "full" | undefined) ?? "summary",
        optionalSessionId(args),
      ),
  },
  {
    name: "analyze_expression",
    description:
      "Parse and type-check a scratch expression without saving it. Does not record diagnostics unless recordDiagnostics=true.",
    inputSchema: {
      type: "object",
      properties: {
        sessionId,
        expression: { type: "string" },
        cstType: { type: "string" },
        recordDiagnostics: { type: "boolean" },
      },
      required: ["expression", "cstType"],
    },
    invoke: (tool, args) =>
      tool.analyzeExpression(
        omitSessionId(args) as never,
        optionalSessionId(args),
      ),
  },
  {
    name: "list_diagnostics",
    description:
      "List active diagnostics for the session: expression (formula), schema (homonyms, duplicates, metadata), model (interpretation status).",
    inputSchema: {
      type: "object",
      properties: {
        sessionId,
        constituentId: { type: "number" },
        kind: { type: "string", enum: ["expression", "schema", "model"] },
      },
    },
    invoke: (tool, args) => {
      const constituentId = args.constituentId;
      const kind = args.kind;
      const filters: {
        constituentId?: number;
        kind?: "expression" | "schema" | "model";
      } = {};
      if (typeof constituentId === "number") {
        filters.constituentId = constituentId;
      }
      if (kind === "expression" || kind === "schema" || kind === "model") {
        filters.kind = kind;
      }
      return tool.listDiagnostics(
        Object.keys(filters).length > 0 ? filters : undefined,
        optionalSessionId(args),
      );
    },
  },
  {
    name: "commit_step",
    description:
      "Record a session revision with an optional human-readable message.",
    inputSchema: {
      type: "object",
      properties: {
        sessionId,
        message: { type: "string" },
      },
    },
    invoke: (tool, args) =>
      tool.commitStep(
        args.message as string | undefined,
        optionalSessionId(args),
      ),
  },
  {
    name: "export_session",
    description:
      "Serialize the session to a JSON string suitable for import_data with kind=session.",
    inputSchema: {
      type: "object",
      properties: { sessionId },
    },
    invoke: (tool, args) => tool.exportSession(optionalSessionId(args)),
  },
  {
    name: "export_portal",
    description:
      "Export Portal Load-from-JSON payload. kind=schema|model; format=json (default string) or object.",
    inputSchema: {
      type: "object",
      properties: {
        sessionId,
        kind: { type: "string", enum: ["schema", "model"] },
        format: { type: "string", enum: ["json", "object"] },
      },
      required: ["kind"],
    },
    invoke: (tool, args) =>
      tool.exportPortal(omitSessionId(args) as never, optionalSessionId(args)),
  },
  {
    name: "import_data",
    description:
      "Import a session from export_session JSON, Portal schema JSON, or GET /api/rsforms/:id/details. kind=auto (default) detects the shape.",
    inputSchema: {
      type: "object",
      properties: {
        payload: {
          description:
            "JSON string or parsed object (session export, Portal schema, or rsform details).",
        },
        kind: {
          type: "string",
          enum: ["auto", "session", "portal-schema", "portal-details"],
        },
      },
      required: ["payload"],
    },
    invoke: (tool, args) =>
      tool.importData(args.payload as string | object, args.kind as never),
  },
  {
    name: "set_model_values",
    description:
      "Set and/or clear interpretable model bindings. Pass set[] for bindings and clear[] for constituent ids to reset.",
    inputSchema: {
      type: "object",
      properties: {
        sessionId,
        set: {
          type: "array",
          items: {
            type: "object",
            properties: {
              target: { type: "number" },
              type: { type: "string" },
              value: {},
            },
            required: ["target", "value"],
          },
        },
        clear: { type: "array", items: { type: "number" } },
      },
    },
    invoke: (tool, args) =>
      tool.setModelValues(
        omitSessionId(args) as never,
        optionalSessionId(args),
      ),
  },
  {
    name: "get_model_state",
    description: "Return the SessionModelState.",
    inputSchema: {
      type: "object",
      properties: { sessionId },
    },
    invoke: (tool, args) => tool.getModelState(optionalSessionId(args)),
  },
  {
    name: "evaluate",
    description:
      "Evaluate a scratch expression (expression + cstType) or a stored constituent (constituentId).",
    inputSchema: {
      type: "object",
      properties: {
        sessionId,
        expression: { type: "string" },
        cstType: { type: "string" },
        constituentId: { type: "number" },
      },
    },
    invoke: (tool, args) =>
      tool.evaluate(omitSessionId(args) as never, optionalSessionId(args)),
  },
  {
    name: "recalculate_model",
    description: "Recompute every inferrable constituent.",
    inputSchema: {
      type: "object",
      properties: { sessionId },
    },
    invoke: (tool, args) => tool.recalculateModel(optionalSessionId(args)),
  },
];
