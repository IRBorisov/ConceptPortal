import { CONTRACT_VERSION } from './models/tool-contract';
import { RSTOOL_ERROR_CODES } from './models/tool-error';
import { STDIO_METHODS } from './wrapper/stdio-handler';

const methods = ['ping', 'methods', ...STDIO_METHODS];
const id = { type: ['string', 'number'] };

export const RSTOOL_RPC_CONTRACT = {
  apiVersion: 1,
  contractVersion: CONTRACT_VERSION,
  operations: methods.map(method => ({ method, mcpTool: method === 'methods' ? 'list_methods' :
    method.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`) })),
  requestSchema: {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    type: 'object', required: ['id', 'method'], additionalProperties: false,
    properties: {
      id, method: { enum: methods }, params: { type: 'object' }, returnSession: { type: 'boolean' },
      state: { oneOf: [
        { type: 'object', required: ['session'], additionalProperties: false, properties: { session: { type: ['object', 'string'] } } },
        { type: 'object', required: ['sessionId'], additionalProperties: false, properties: { sessionId: { type: 'string', minLength: 1 } } },
      ] },
    },
  },
  responseSchema: {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    oneOf: [
      { type: 'object', required: ['id', 'ok', 'result'], additionalProperties: false,
        properties: { id, ok: { const: true }, result: {}, session: { type: 'string' } } },
      { type: 'object', required: ['id', 'ok', 'error'], additionalProperties: false,
        properties: { id: { type: ['string', 'number', 'null'] }, ok: { const: false }, error: { $ref: '#/$defs/error' } } },
    ],
    $defs: { error: { type: 'object', required: ['code', 'message'], additionalProperties: false, properties: {
      code: { enum: [...RSTOOL_ERROR_CODES, 'BAD_REQUEST', 'METHOD_NOT_FOUND', 'INTERNAL_ERROR', 'UNAUTHORIZED',
        'NOT_FOUND', 'METHOD_NOT_ALLOWED', 'REQUEST_TOO_LARGE', 'RESPONSE_TOO_LARGE', 'BUSY', 'STATE_UNAVAILABLE'] },
      message: { type: 'string' },
    } } },
  },
} as const;
