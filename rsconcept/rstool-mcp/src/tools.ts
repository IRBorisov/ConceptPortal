/**
 * MCP tool definitions for the @rsconcept/rstool contract.
 *
 * Schemas are intentionally permissive (additionalProperties: true) where the rstool input
 * is structurally rich (e.g. ConstituentaDraft, SessionState). The wrapped RSToolAgent
 * validates inputs at runtime and returns deterministic error responses.
 */

import { type RSToolAgent } from '@rsconcept/rstool';

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
    additionalProperties?: boolean;
  };
  invoke: (tool: RSToolAgent, args: Record<string, unknown>) => unknown | Promise<unknown>;
}

const sessionId = {
  type: 'string',
  description: 'Session identifier returned from create_session or import_session.'
};

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: 'ping',
    description: 'Liveness check; returns {pong: true} and the active rstool contract version.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    invoke: tool => ({ pong: true, contractVersion: tool.contractVersion })
  },
  {
    name: 'list_methods',
    description: 'List all rstool methods exposed as MCP tools.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    invoke: () => TOOL_DEFINITIONS.map(definition => definition.name)
  },
  {
    name: 'create_session',
    description:
      'Create a fresh in-memory rstool session. Returns a SessionHandle with sessionId and initial revision.',
    inputSchema: {
      type: 'object',
      properties: {
        initial: {
          type: 'object',
          description: 'Optional partial SessionState seed (alias, title, constituents, etc.).',
          additionalProperties: true
        }
      },
      additionalProperties: false
    },
    invoke: (tool, args) => tool.createSession(args.initial as never)
  },
  {
    name: 'add_or_update_constituenta',
    description:
      'Upsert a single constituent in the session. Provide alias, cstType, definitionFormal (may be ""), and optional term/definitionText/convention.',
    inputSchema: {
      type: 'object',
      properties: {
        sessionId,
        input: {
          type: 'object',
          description: 'AddOrUpdateConstituentaInput. Required keys: alias, cstType, definitionFormal.',
          additionalProperties: true
        }
      },
      required: ['sessionId', 'input']
    },
    invoke: (tool, args) =>
      tool.addOrUpdateConstituenta(String(args.sessionId), args.input as never)
  },
  {
    name: 'analyze_expression',
    description:
      'Run parser + semantic analysis on a scratch RSLang expression in the session context. Returns typification, valueClass, success flag and diagnostics.',
    inputSchema: {
      type: 'object',
      properties: {
        sessionId,
        input: {
          type: 'object',
          description: 'AnalyzeExpressionInput. Required keys: expression, cstType.',
          properties: {
            expression: { type: 'string' },
            cstType: { type: 'string' },
            alias: { type: 'string' }
          },
          required: ['expression', 'cstType'],
          additionalProperties: true
        }
      },
      required: ['sessionId', 'input']
    },
    invoke: (tool, args) =>
      tool.analyzeExpression(String(args.sessionId), args.input as never)
  },
  {
    name: 'get_form_state',
    description: 'Return the full SessionState (constituents, revision, alias, title, etc.).',
    inputSchema: {
      type: 'object',
      properties: { sessionId },
      required: ['sessionId']
    },
    invoke: (tool, args) => tool.getFormState(String(args.sessionId))
  },
  {
    name: 'list_diagnostics',
    description:
      'List diagnostics across the session, optionally filtered by constituentId / severity / classes.',
    inputSchema: {
      type: 'object',
      properties: {
        sessionId,
        filters: {
          type: 'object',
          description: 'Optional ListDiagnosticsFilters object.',
          additionalProperties: true
        }
      },
      required: ['sessionId']
    },
    invoke: (tool, args) =>
      tool.listDiagnostics(String(args.sessionId), args.filters as never)
  },
  {
    name: 'commit_step',
    description: 'Record a session revision with an optional human-readable message.',
    inputSchema: {
      type: 'object',
      properties: {
        sessionId,
        message: { type: 'string' }
      },
      required: ['sessionId']
    },
    invoke: (tool, args) =>
      tool.commitStep(String(args.sessionId), args.message as string | undefined)
  },
  {
    name: 'export_session',
    description: 'Serialize the session to a JSON string suitable for import_session.',
    inputSchema: {
      type: 'object',
      properties: { sessionId },
      required: ['sessionId']
    },
    invoke: (tool, args) => tool.exportSession(String(args.sessionId))
  },
  {
    name: 'import_session',
    description:
      'Import a session previously produced by export_session. Returns a fresh SessionHandle pointing at the restored state.',
    inputSchema: {
      type: 'object',
      properties: {
        payload: { type: 'string', description: 'JSON payload from export_session.' }
      },
      required: ['payload']
    },
    invoke: (tool, args) => tool.importSession(String(args.payload))
  },
  {
    name: 'set_constituenta_value',
    description:
      'Bind or assign a value to a single interpretable constituent (basic, constant, structure). Inferrable constituents (term, axiom, statement) cannot be set directly.',
    inputSchema: {
      type: 'object',
      properties: {
        sessionId,
        input: {
          type: 'object',
          description: 'SetConstituentaValueInput. Required keys: target (id), value.',
          additionalProperties: true
        }
      },
      required: ['sessionId', 'input']
    },
    invoke: (tool, args) =>
      tool.setConstituentaValue(String(args.sessionId), args.input as never)
  },
  {
    name: 'set_constituenta_values',
    description: 'Batch variant of set_constituenta_value: assign values to multiple interpretable constituents.',
    inputSchema: {
      type: 'object',
      properties: {
        sessionId,
        input: {
          type: 'object',
          description: 'SetConstituentaValuesInput. Required keys: values (list of {target, value}).',
          additionalProperties: true
        }
      },
      required: ['sessionId', 'input']
    },
    invoke: (tool, args) =>
      tool.setConstituentaValues(String(args.sessionId), args.input as never)
  },
  {
    name: 'clear_constituenta_values',
    description: 'Clear current values for one or more constituents and reset dependents to NOT_PROCESSED.',
    inputSchema: {
      type: 'object',
      properties: {
        sessionId,
        input: {
          type: 'object',
          description: 'ClearConstituentaValuesInput. Required keys: targets (list of ids).',
          additionalProperties: true
        }
      },
      required: ['sessionId', 'input']
    },
    invoke: (tool, args) =>
      tool.clearConstituentaValues(String(args.sessionId), args.input as never)
  },
  {
    name: 'get_model_state',
    description: 'Return the SessionModelState — current values and evaluation statuses for every constituent.',
    inputSchema: {
      type: 'object',
      properties: { sessionId },
      required: ['sessionId']
    },
    invoke: (tool, args) => tool.getModelState(String(args.sessionId))
  },
  {
    name: 'evaluate_expression',
    description:
      'Evaluate a scratch RSLang expression against the current bindings without storing it. Returns value + evaluation status.',
    inputSchema: {
      type: 'object',
      properties: {
        sessionId,
        input: {
          type: 'object',
          description: 'EvaluateExpressionInput. Required keys: expression. Optional: cstType, alias.',
          properties: {
            expression: { type: 'string' },
            cstType: { type: 'string' },
            alias: { type: 'string' }
          },
          required: ['expression'],
          additionalProperties: true
        }
      },
      required: ['sessionId', 'input']
    },
    invoke: (tool, args) =>
      tool.evaluateExpression(String(args.sessionId), args.input as never)
  },
  {
    name: 'evaluate_constituenta',
    description: 'Evaluate a stored derived constituent (term, axiom, statement) using the current bindings.',
    inputSchema: {
      type: 'object',
      properties: {
        sessionId,
        input: {
          type: 'object',
          description: 'EvaluateConstituentaInput. Required keys: target (id).',
          additionalProperties: true
        }
      },
      required: ['sessionId', 'input']
    },
    invoke: (tool, args) =>
      tool.evaluateConstituenta(String(args.sessionId), args.input as never)
  },
  {
    name: 'recalculate_model',
    description: 'Recompute every interpretable / inferrable constituent using current bindings. Returns the updated SessionModelState.',
    inputSchema: {
      type: 'object',
      properties: { sessionId },
      required: ['sessionId']
    },
    invoke: (tool, args) => tool.recalculateModel(String(args.sessionId))
  }
];
