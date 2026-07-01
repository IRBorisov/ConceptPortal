import { type ImportDataKind } from './import-export';

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function parseImportPayload(payload: string | object): unknown {
  if (typeof payload === 'string') {
    return JSON.parse(payload) as unknown;
  }
  return payload;
}

export function detectImportKind(data: unknown): Exclude<ImportDataKind, 'auto'> {
  if (!isRecord(data)) {
    throw new Error('Invalid import payload');
  }

  if ('contractVersion' in data && 'state' in data) {
    return 'session';
  }

  if ('contract_version' in data && Array.isArray(data.items)) {
    const items = data.items as unknown[];
    if (items.length > 0) {
      const first = items[0];
      if (isRecord(first) && 'cst_type' in first) {
        return 'portal-schema';
      }
      throw new Error('Portal model JSON cannot be imported as a schema session');
    }
  }

  if (Array.isArray(data.items) && data.items.length > 0) {
    const first = data.items[0];
    if (isRecord(first) && 'cst_type' in first) {
      return 'portal-details';
    }
  }

  throw new Error('Cannot detect import kind; pass kind explicitly');
}
