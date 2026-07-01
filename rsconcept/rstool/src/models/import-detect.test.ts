import { describe, expect, it } from 'vitest';

import { CstType } from './common';
import { detectImportKind, parseImportPayload } from './import-detect';

describe('parseImportPayload', () => {
  it('parses JSON strings', () => {
    expect(parseImportPayload('{"title":"x"}')).toEqual({ title: 'x' });
  });

  it('returns objects unchanged', () => {
    const payload = { title: 'x' };
    expect(parseImportPayload(payload)).toBe(payload);
  });
});

describe('detectImportKind', () => {
  it('detects session exports', () => {
    expect(detectImportKind({ contractVersion: '2.0.0', state: { items: [] } })).toBe('session');
  });

  it('detects portal schema JSON', () => {
    expect(
      detectImportKind({
        contract_version: '1.0.0',
        items: [{ id: 1, alias: 'X1', cst_type: CstType.BASE }]
      })
    ).toBe('portal-schema');
  });

  it('detects portal details JSON', () => {
    expect(
      detectImportKind({
        title: 'Schema',
        items: [{ id: 1, alias: 'X1', cst_type: CstType.BASE }]
      })
    ).toBe('portal-details');
  });

  it('rejects model JSON as schema session', () => {
    expect(() =>
      detectImportKind({
        contract_version: '1.0.0',
        items: [{ id: 1, type: 'basic', value: { 0: 'a' } }]
      })
    ).toThrow(/Portal model JSON cannot be imported/);
  });

  it('treats empty contract_version items as undetectable', () => {
    expect(() =>
      detectImportKind({
        contract_version: '1.0.0',
        items: []
      })
    ).toThrow(/Cannot detect import kind/);
  });

  it('rejects non-objects', () => {
    expect(() => detectImportKind(null)).toThrow(/Invalid import payload/);
    expect(() => detectImportKind('string')).toThrow(/Invalid import payload/);
  });

  it('rejects undetectable payloads', () => {
    expect(() => detectImportKind({ title: 'orphan' })).toThrow(/Cannot detect import kind/);
  });
});
