import { describe, expect, it } from 'vitest';

import { RSErrorCode } from '../rslang/error';

import { CstType, type RSForm } from './rsform';
import { applyMappingToConstituents, getAnalysisFor, validateAliasFormat } from './rsform-api';

const emptySchema = {} as RSForm;

describe('validateAliasFormat', () => {
  it('accepts alias with type prefix and numeric suffix', () => {
    expect(validateAliasFormat('X1', CstType.BASE)).toBe(true);
    expect(validateAliasFormat('D12', CstType.TERM)).toBe(true);
  });

  it('rejects alias with wrong prefix for type', () => {
    expect(validateAliasFormat('D1', CstType.BASE)).toBe(false);
  });

  it('rejects alias without numeric suffix', () => {
    expect(validateAliasFormat('X', CstType.BASE)).toBe(false);
    expect(validateAliasFormat('XA', CstType.BASE)).toBe(false);
  });

  it('rejects duplicate-looking aliases with non-digit suffix', () => {
    expect(validateAliasFormat('X1a', CstType.BASE)).toBe(false);
  });
});

describe('getAnalysisFor', () => {
  it('rejects formal definition for basic sets with params', () => {
    const result = getAnalysisFor('Z', CstType.BASE, emptySchema, 'X1');
    expect(result.success).toBe(false);
    expect(result.errors[0]).toMatchObject({
      code: RSErrorCode.definitionNotAllowed,
      from: 0,
      to: 1,
      params: [CstType.BASE, 'X1']
    });
  });

  it('rejects formal definition for constants with params', () => {
    const result = getAnalysisFor('X1', CstType.CONSTANT, emptySchema, 'C1');
    expect(result.success).toBe(false);
    expect(result.errors[0]).toMatchObject({
      code: RSErrorCode.definitionNotAllowed,
      from: 0,
      to: 2,
      params: [CstType.CONSTANT, 'C1']
    });
  });
});

describe('applyMappingToConstituents', () => {
  it('updates formal expressions and terminological references', () => {
    const items = [
      {
        alias: 'X3',
        definition_formal: 'X1 = X2',
        typification_manual: 'ℬ(X1)',
        term_raw: '@{X1|sing}',
        definition_raw: '@{X2|sing}'
      }
    ];

    applyMappingToConstituents(items, { X1: 'X3', X2: 'X4' }, false);

    expect(items[0].definition_formal).toBe('X3 = X4');
    expect(items[0].typification_manual).toBe('ℬ(X3)');
    expect(items[0].term_raw).toBe('@{X3|sing}');
    expect(items[0].definition_raw).toBe('@{X4|sing}');
  });
});
