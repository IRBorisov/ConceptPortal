import readline from 'node:readline';

import { RSFormAgentTool } from '../index';

interface StdioRequest {
  id: string | number;
  method: string;
  params?: unknown;
}

interface StdioResponse {
  id: string | number | null;
  ok: boolean;
  result?: unknown;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

const tool = new RSFormAgentTool();

const METHODS = [
  'createSession',
  'addOrUpdateConstituenta',
  'analyzeExpression',
  'getFormState',
  'listDiagnostics',
  'commitStep',
  'exportSession',
  'importSession'
] as const;

function writeResponse(response: StdioResponse): void {
  if (!process.stdout.writable || process.stdout.destroyed || process.stdout.writableEnded) {
    return;
  }
  try {
    process.stdout.write(`${JSON.stringify(response)}\n`);
  } catch {
    // The client might have already closed stdout (EPIPE). Safe to ignore.
  }
}

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

function handleRequest(request: StdioRequest): StdioResponse {
  try {
    const params = asObject(request.params);
    switch (request.method) {
      case 'ping':
        return { id: request.id, ok: true, result: { pong: true } };
      case 'methods':
        return { id: request.id, ok: true, result: METHODS };
      case 'createSession':
        return {
          id: request.id,
          ok: true,
          result: tool.createSession(params.initial as never)
        };
      case 'addOrUpdateConstituenta':
        return {
          id: request.id,
          ok: true,
          result: tool.addOrUpdateConstituenta(requiredString(params, 'sessionId'), params.input as never)
        };
      case 'analyzeExpression':
        return {
          id: request.id,
          ok: true,
          result: tool.analyzeExpression(requiredString(params, 'sessionId'), params.input as never)
        };
      case 'getFormState':
        return {
          id: request.id,
          ok: true,
          result: tool.getFormState(requiredString(params, 'sessionId'))
        };
      case 'listDiagnostics':
        return {
          id: request.id,
          ok: true,
          result: tool.listDiagnostics(requiredString(params, 'sessionId'), params.filters as never)
        };
      case 'commitStep':
        return {
          id: request.id,
          ok: true,
          result: tool.commitStep(requiredString(params, 'sessionId'), params.message as string | undefined)
        };
      case 'exportSession':
        return {
          id: request.id,
          ok: true,
          result: tool.exportSession(requiredString(params, 'sessionId'))
        };
      case 'importSession':
        return {
          id: request.id,
          ok: true,
          result: tool.importSession(requiredString(params, 'payload'))
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

const input = readline.createInterface({
  input: process.stdin,
  crlfDelay: Infinity
});

writeResponse({
  id: null,
  ok: true,
  result: {
    ready: true,
    wrapper: 'rstool-stdio',
    contractVersion: tool.contractVersion
  }
});

input.on('line', line => {
  if (!line.trim()) {
    return;
  }
  try {
    const request = JSON.parse(line) as StdioRequest;
    if (!('id' in request) || !('method' in request)) {
      throw new Error('Request must include "id" and "method"');
    }
    writeResponse(handleRequest(request));
  } catch (error) {
    writeResponse({
      id: null,
      ok: false,
      error: {
        code: 'BAD_REQUEST',
        message: error instanceof Error ? error.message : 'Invalid JSON'
      }
    });
  }
});
