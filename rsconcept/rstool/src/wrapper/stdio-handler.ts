import type { RSToolAgent } from '../models/rstool-agent';

export interface StdioRequest {
  id: string | number;
  method: string;
  params?: unknown;
}

export interface StdioResponse {
  id: string | number | null;
  ok: boolean;
  result?: unknown;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export const STDIO_METHODS = [
  'ensureSession',
  'createSession',
  'getCurrentSession',
  'setCurrentSession',
  'applySchemaPatch',
  'getSessionState',
  'listDiagnostics',
  'analyzeExpression',
  'commitStep',
  'exportSession',
  'exportPortal',
  'importData',
  'setModelValues',
  'getModelState',
  'evaluate',
  'recalculateModel',
  'restoreOrder'
] as const;

function asObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
}

function requiredString(input: Record<string, unknown>, key: string): string {
  const value = input[key];
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Missing or invalid "${key}"`);
  }
  return value;
}

function optionalSessionId(input: Record<string, unknown>): string | undefined {
  const value = input.sessionId;
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function omitSessionId(input: Record<string, unknown>): Record<string, unknown> {
  const { sessionId: _sessionId, ...rest } = input;
  return rest;
}

export async function handleStdioRequest(tool: RSToolAgent, request: StdioRequest): Promise<StdioResponse> {
  try {
    const params = asObject(request.params);
    switch (request.method) {
      case 'ping':
        return { id: request.id, ok: true, result: { pong: true, contractVersion: tool.contractVersion } };
      case 'methods':
        return { id: request.id, ok: true, result: STDIO_METHODS };
      case 'ensureSession':
        return {
          id: request.id,
          ok: true,
          result: tool.ensureSession(params.initial as never)
        };
      case 'createSession':
        return {
          id: request.id,
          ok: true,
          result: tool.createSession(params.initial as never)
        };
      case 'getCurrentSession':
        return {
          id: request.id,
          ok: true,
          result: tool.getCurrentSession()
        };
      case 'setCurrentSession':
        return {
          id: request.id,
          ok: true,
          result: tool.setCurrentSession(requiredString(params, 'sessionId'))
        };
      case 'applySchemaPatch':
        return {
          id: request.id,
          ok: true,
          result: tool.applySchemaPatch(omitSessionId(params) as never, optionalSessionId(params))
        };
      case 'getSessionState':
        return {
          id: request.id,
          ok: true,
          result: tool.getSessionState(
            (params.detail as 'summary' | 'full' | undefined) ?? 'summary',
            optionalSessionId(params)
          )
        };
      case 'listDiagnostics': {
        const constituentId = params.constituentId;
        const filters = typeof constituentId === 'number' ? { constituentId } : (params.filters as never);
        return {
          id: request.id,
          ok: true,
          result: tool.listDiagnostics(filters, optionalSessionId(params))
        };
      }
      case 'analyzeExpression':
        return {
          id: request.id,
          ok: true,
          result: tool.analyzeExpression(omitSessionId(params) as never, optionalSessionId(params))
        };
      case 'commitStep':
        return {
          id: request.id,
          ok: true,
          result: tool.commitStep(params.message as string | undefined, optionalSessionId(params))
        };
      case 'exportSession':
        return {
          id: request.id,
          ok: true,
          result: tool.exportSession(optionalSessionId(params))
        };
      case 'exportPortal':
        return {
          id: request.id,
          ok: true,
          result: tool.exportPortal(omitSessionId(params) as never, optionalSessionId(params))
        };
      case 'importData':
        return {
          id: request.id,
          ok: true,
          result: tool.importData(params.payload as string | object, params.kind as never)
        };
      case 'setModelValues':
        return {
          id: request.id,
          ok: true,
          result: await tool.setModelValues(omitSessionId(params) as never, optionalSessionId(params))
        };
      case 'getModelState':
        return {
          id: request.id,
          ok: true,
          result: tool.getModelState(optionalSessionId(params))
        };
      case 'evaluate':
        return {
          id: request.id,
          ok: true,
          result: tool.evaluate(omitSessionId(params) as never, optionalSessionId(params))
        };
      case 'recalculateModel':
        return {
          id: request.id,
          ok: true,
          result: tool.recalculateModel(optionalSessionId(params))
        };
      case 'restoreOrder':
        return {
          id: request.id,
          ok: true,
          result: tool.restoreOrder(optionalSessionId(params))
        };
      default:
        return {
          id: request.id ?? null,
          ok: false,
          error: {
            code: 'METHOD_NOT_FOUND',
            message: `Unknown method: ${request.method}`
          }
        };
    }
  } catch (error) {
    return {
      id: request.id ?? null,
      ok: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error
      }
    };
  }
}
