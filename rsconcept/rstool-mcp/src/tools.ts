/**
 * MCP tool definitions for the @rsconcept/rstool contract.
 */

import { CstType, EvalStatus, type RSToolAgent } from "@rsconcept/rstool";
import type { PortalPublisher } from './portal-publisher';
import { SessionStorageError, type SessionPolicy } from './session-policy';

/** Trusted HTTP host captures the identity; tools cannot accept a key, subject or publication approval. */
export function portalToolDefinitions(publisher: PortalPublisher, subject: string, workspace: string,
  validateSource?: (sessionId: string) => void): ToolDefinition[] {
  return [{ name: 'portal_prepare_publication', description: 'Prepare replacement of an existing owned Portal schema. Does not publish. Review and approve on the separate account page.',
    inputSchema: { type: 'object', properties: { targetId: { type: 'integer', minimum: 1 } }, required: ['targetId'], additionalProperties: false },
    invoke: (tool, args) => {
      if (Object.keys(args).length !== 1) throw new Error('Only targetId is accepted');
      return publisher.prepare(subject, workspace, args.targetId as number, tool, validateSource);
    },
  }, { name: 'portal_connection_status', sessionActivity: 'none', description: 'Get safe Portal connection status for the authenticated identity, without any credential.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    invoke: (_tool, args) => {
      if (Object.keys(args).length) throw new Error('This tool accepts no arguments');
      return publisher.connection(subject);
    } }, { name: 'portal_update_description', sessionActivity: 'none',
    description: 'Update only an existing Portal schema description with compare-and-set and readback. Requires targetId, expectedTimeUpdate from a fresh Portal read, and description. Uses the bound credential. No rstool session or full publication approval is needed. Never retries uncertain writes.',
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true },
    inputSchema: { type: 'object', properties: { targetId: { type: 'integer', minimum: 1 },
      expectedTimeUpdate: { type: 'string' }, description: { type: 'string', maxLength: 100000 } },
      required: ['targetId', 'expectedTimeUpdate', 'description'], additionalProperties: false },
    invoke: (_tool, args) => {
      if (Object.keys(args).some(key => !['targetId', 'expectedTimeUpdate', 'description'].includes(key)))
        throw new Error('Only targetId, expectedTimeUpdate and description are accepted');
      return publisher.updateDescription(subject, args.targetId as number, args.expectedTimeUpdate as string, args.description as string);
    } }];
}

/** Account-scoped storage management; credentials and filesystem paths are never tool arguments. */
export function sessionStorageToolDefinitions(policy: SessionPolicy, subject: string, namespace: string,
  config: { cleanupIntervalMs: number; maxActiveSessions: number; idleTimeoutMs: number; maxPendingRequests: number; maxRequestBodySize: number }): ToolDefinition[] {
  return [{
    name: 'get_session_storage_config', sessionActivity: 'none',
    description: 'Get effective stored-session limits, inactivity retention and your account usage across all workspaces. Read-only; never returns credentials or extends retention.',
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    invoke: (_tool, args) => {
      checkArguments(args, []);
      return { ...policy.configuration(subject, config.cleanupIntervalMs), transport: {
        maxActiveSessionsGlobal: config.maxActiveSessions, idleTimeoutSeconds: config.idleTimeoutMs / 1000,
        maxPendingRequestsPerWorkspace: config.maxPendingRequests, maxRequestBodyBytes: config.maxRequestBodySize
      } };
    }
  }, {
    name: 'list_stored_sessions', sessionActivity: 'none',
    description: 'List your stored sessions across workspaces, oldest used first. Returns bounded metadata, exact sessionRef and revision for deletion; does not renew TTL or expose schema contents. Follow nextCursor; restart listing on SESSION_LIST_CHANGED.',
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    inputSchema: { type: 'object', properties: { limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
      cursor: { type: 'string', maxLength: 2048 } }, additionalProperties: false },
    invoke: (_tool, args) => {
      checkArguments(args, ['limit', 'cursor']);
      return policy.list(subject, namespace, args.limit as number | undefined, args.cursor as string | undefined);
    }
  }, {
    name: 'delete_stored_session', sessionActivity: 'none',
    description: 'Destructively delete exactly one of your stored sessions and free its quota slot. Use sessionRef and revision from a fresh list. Busy workspaces cannot be deleted; changed sessions require re-listing. confirm=true expresses call intent, not proof of human approval. Follow client/user approval policy; set allowCurrent=true only to discard a selected session. Clears selection/cache and pending workspace publications.',
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false },
    inputSchema: { type: 'object', properties: {
      sessionRef: { type: 'string', maxLength: 2048 }, expectedRevision: { type: 'string', pattern: '^[a-f0-9]{64}$' },
      confirm: { type: 'boolean', const: true }, allowCurrent: { type: 'boolean', default: false }
    }, required: ['sessionRef', 'expectedRevision', 'confirm'], additionalProperties: false },
    invoke: (_tool, args) => {
      checkArguments(args, ['sessionRef', 'expectedRevision', 'confirm', 'allowCurrent']);
      if (args.allowCurrent !== undefined && typeof args.allowCurrent !== 'boolean') {
        throw new SessionStorageError('INVALID_SESSION_ARGUMENTS', 'allowCurrent must be a boolean.');
      }
      return policy.delete(subject, args.sessionRef as string, args.expectedRevision as string,
        args.confirm as boolean, args.allowCurrent as boolean | undefined);
    }
  }];
}

/** Reject unrecognized fields rather than accepting caller-supplied identities or paths. */
function checkArguments(args: Record<string, unknown>, allowed: string[]): void {
  if (Object.keys(args).some(key => !allowed.includes(key))) {
    throw new SessionStorageError('INVALID_SESSION_ARGUMENTS', 'Only documented tool arguments are accepted.');
  }
}

export interface ToolDefinition {
  name: string;
  description: string;
  /** Defaults to model pinning. Explicitly independent tools cannot keep models busy. */
  sessionActivity?: 'none' | 'model';
  annotations?: { readOnlyHint?: boolean; destructiveHint?: boolean; idempotentHint?: boolean; openWorldHint?: boolean };
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

const cstType = {
  type: "string", enum: Object.values(CstType),
  description: "Constituent type: X=basic, C=constant, S=structure, D=term, A=axiom, F=function, P=predicate, T=statement, N=nominal."
};
const evaluationStatuses = Object.entries(EvalStatus).map(([name, value]) => `${value}=${name}`).join(", ");

const agentPatchSchema = {
  type: "object",
  description:
    "Agent-friendly constituent patch. id and cstType are optional; cstType is inferred from alias prefixes X/C/S/D/A/F/P.",
  properties: {
    id: { type: "number" },
    alias: { type: "string" },
    cstType,
    definitionFormal: { type: "string" },
    term: { type: "string" },
    definitionText: { type: "string" },
    convention: { type: "string", description: "Intended meaning of an undefined X/C/S concept. Supply non-empty text to resolve schemaMissingConvention; do not invent a formal definition for X/C." },
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
    name: "ping", sessionActivity: "none",
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
    name: "list_methods", sessionActivity: "none",
    description: "List all tools exposed by this MCP server, including hosted integrations when configured.",
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
      "Create a fresh rstool session and make it current. Hosted HTTP sessions are durable and consume the account quota; inspect get_session_storage_config when available.",
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
        cstType,
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
        severity: { type: "string", enum: ["error", "warning"] },
      },
    },
    invoke: (tool, args) => {
      const constituentId = args.constituentId;
      const kind = args.kind;
      const severity = args.severity;
      const filters: {
        constituentId?: number;
        kind?: "expression" | "schema" | "model";
        severity?: "error" | "warning";
      } = {};
      if (typeof constituentId === "number") {
        filters.constituentId = constituentId;
      }
      if (kind === "expression" || kind === "schema" || kind === "model") {
        filters.kind = kind;
      }
      if (severity === "error" || severity === "warning") {
        filters.severity = severity;
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
      "Set and/or clear X/C/S model bindings by numeric constituent ids from get_session_state. For X/C, use an object mapping integer element ids to labels, e.g. {0: \"one\", 1: \"two\"}. For S, use numbers or nested arrays: sets [0,1], tuples [-111,0,1] and sets of tuples [[-111,0,1]]. Derived D/F/P values are computed, never assigned. Pass clear[] for ids to reset.",
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
      `Evaluate exactly one variant: scratch expression + cstType, or stored numeric constituentId from get_session_state. Result.status: ${evaluationStatuses}. Result.statusName names the status. Native values encode sets as arrays, tuples as [-111,...components], sets of tuples as [[-111,0,1]], and booleans as 0/1; success means evaluation completed, not that an axiom is true or input bindings were populated. Check get_model_state before interpreting an empty result.`,
    inputSchema: {
      type: "object",
      properties: {
        sessionId,
        expression: { type: "string" },
        cstType,
        constituentId: { type: "number" },
      },
    },
    invoke: (tool, args) =>
      tool.evaluate(omitSessionId(args) as never, optionalSessionId(args)),
  },
  {
    name: "recalculate_model",
    description: `Recompute every inferrable constituent. Each item returns numeric status: ${evaluationStatuses}. Boolean values use 0/1.`,
    inputSchema: {
      type: "object",
      properties: { sessionId },
    },
    invoke: (tool, args) => tool.recalculateModel(optionalSessionId(args)),
  },
  {
    name: "restore_order",
    description:
      "Restore constituent declaration order: formal topology, semantic clusters when ready, otherwise stable type/kernel ranks.",
    inputSchema: {
      type: "object",
      properties: { sessionId },
    },
    invoke: (tool, args) => tool.restoreOrder(optionalSessionId(args)),
  },
  {
    name: "synthesize",
    description:
      "Synthesis by embedding: merge constituents from sourceSessionId into the receiver session, then apply an identification table (aliases).",
    inputSchema: {
      type: "object",
      properties: {
        sessionId,
        sourceSessionId: {
          type: "string",
          description: "Session to merge from (must differ from the receiver).",
        },
        items: {
          type: "array",
          items: { type: "string" },
          description:
            "Optional source aliases to import. Omit or empty = import all.",
        },
        substitutions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              original: { type: "string" },
              substitution: { type: "string" },
            },
            required: ["original", "substitution"],
          },
          description:
            "Identification table: each row pairs one source alias with one receiver alias.",
        },
        commitMessage: { type: "string" },
      },
      required: ["sourceSessionId"],
      additionalProperties: true,
    },
    invoke: (tool, args) =>
      tool.synthesize(omitSessionId(args) as never, optionalSessionId(args)),
  },
];
