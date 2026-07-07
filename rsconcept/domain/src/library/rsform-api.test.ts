import { describe, expect, it } from 'vitest';

import { RSErrorCode } from '../rslang/error';

import { CstType, type RSForm } from './rsform';
import {
  applyMappingToConstituents,
  findCstByStructure,
  getAnalysisFor,
  normalizeExpression,
  validateAliasFormat
} from './rsform-api';

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

  it('updates aliases when changeAliases is true', () => {
    const items = [
      {
        alias: 'X1',
        definition_formal: 'X1',
        typification_manual: '',
        term_raw: '',
        definition_raw: ''
      }
    ];

    applyMappingToConstituents(items, { X1: 'X3' }, true);

    expect(items[0].alias).toBe('X3');
    expect(items[0].definition_formal).toBe('X3');
  });
});

describe('normalizeExpression', () => {
  it('normalizes spacing in derived definitions', () => {
    expect(normalizeExpression('1 = 2', CstType.TERM)).toBe('1=2');
  });

  it('returns null for basic sets', () => {
    expect(normalizeExpression('ℬ(X1)', CstType.STRUCTURED)).toBeNull();
  });
});

describe('findCstByStructure', () => {
  function makeProjectionChainSchema() {
    const s1 = { id: 1, alias: 'S1' };
    const d1 = { id: 2, alias: 'D1', spawner: 1, spawner_path: [0, 1] };
    const d2 = { id: 3, alias: 'D2', spawner: 2, spawner_path: [2] };
    const d3 = { id: 4, alias: 'D3', spawner: 3, spawner_path: [1] };
    const d4 = { id: 5, alias: 'D4', spawner: 4, spawner_path: [2] };
    const schema = {
      items: [s1, d1, d2, d3, d4],
      cstByID: new Map([
        [1, s1],
        [2, d1],
        [3, d2],
        [4, d3],
        [5, d4]
      ])
    } as unknown as RSForm;
    return { schema, s1, d1, d2, d3, d4 };
  }

  it('resolves chain of relative projection paths to root target', () => {
    const { schema, s1, d2 } = makeProjectionChainSchema();

    expect(findCstByStructure(schema, s1 as never, [0, 1, 2] as never)).toBe(d2);
  });

  it('resolves a four-step projection chain from the root structure', () => {
    const { schema, s1, d1, d2, d3, d4 } = makeProjectionChainSchema();

    expect(findCstByStructure(schema, s1 as never, [0, 1] as never)).toBe(d1);
    expect(findCstByStructure(schema, s1 as never, [0, 1, 2] as never)).toBe(d2);
    expect(findCstByStructure(schema, s1 as never, [0, 1, 2, 1] as never)).toBe(d3);
    expect(findCstByStructure(schema, s1 as never, [0, 1, 2, 1, 2] as never)).toBe(d4);
    expect(findCstByStructure(schema, s1 as never, [0, 1, 2, 2] as never)).toBeNull();
  });
});
