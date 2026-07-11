import { describe, expect, it } from 'vitest';

import { CstType } from '../rsform';

import {
  allocateImportAliases,
  applyConstituentSubstitutions,
  buildSequentialAliasMapping,
  filterAttributions,
  importAttributions,
  insertItemAfter,
  maxAliasIndex,
  moveIdsInOrder,
  remapAttributionsUnderSubstitution,
  remapSubstitutionsAfterImport,
  reorderItemsByIds
} from './index';

describe('maxAliasIndex / sequential and import aliases', () => {
  it('finds max numeric suffix per type', () => {
    expect(
      maxAliasIndex(
        [
          { alias: 'X1', cst_type: CstType.BASE },
          { alias: 'X4', cst_type: CstType.BASE }
        ],
        CstType.BASE
      )
    ).toBe(4);
    expect(maxAliasIndex([{ alias: 'D2', cst_type: CstType.TERM }], CstType.BASE)).toBe(0);
  });

  it('builds sequential alias mapping in list order', () => {
    const mapping = buildSequentialAliasMapping([
      { alias: 'X9', cst_type: CstType.BASE },
      { alias: 'X1', cst_type: CstType.BASE },
      { alias: 'D5', cst_type: CstType.TERM }
    ]);
    expect(mapping).toEqual({ X9: 'X1', X1: 'X2', D5: 'D1' });
  });

  it('allocates import aliases only when receiver is non-empty', () => {
    expect(allocateImportAliases([], [{ alias: 'X9', cst_type: CstType.BASE }])).toEqual({});
    expect(
      allocateImportAliases([{ alias: 'X2', cst_type: CstType.BASE }], [{ alias: 'X9', cst_type: CstType.BASE }])
    ).toEqual({ X9: 'X3' });
  });
});

describe('attribution remapping', () => {
  it('remaps attributions under substitution and drops self-loops', () => {
    const remapped = remapAttributionsUnderSubstitution(
      [
        { container: 1, attribute: 10 },
        { container: 2, attribute: 20 },
        { container: 1, attribute: 2 }
      ],
      new Map([
        [1, 2],
        [10, 20]
      ])
    );
    expect(remapped).toEqual([{ container: 2, attribute: 20 }]);
  });

  it('imports attributions with id map and dedupe against existing', () => {
    const imported = importAttributions(
      [
        { container: 10, attribute: 11 },
        { container: 10, attribute: 99 }
      ],
      new Set([10, 11]),
      { 10: 100, 11: 101 },
      [{ container: 100, attribute: 101 }]
    );
    expect(imported).toEqual([{ container: 100, attribute: 101 }]);
  });

  it('filters attributions by deleted ids', () => {
    expect(
      filterAttributions(
        [
          { container: 1, attribute: 2 },
          { container: 3, attribute: 4 }
        ],
        new Set([1])
      )
    ).toEqual([{ container: 3, attribute: 4 }]);
  });
});

describe('transforms', () => {
  it('moves ids within order', () => {
    expect(moveIdsInOrder([1, 2, 3, 4], [2, 3], 0)).toEqual([2, 3, 1, 4]);
    expect(moveIdsInOrder([1, 2, 3], [3], 99)).toEqual([1, 2, 3]);
  });

  it('reorders items by ids', () => {
    const items = [
      { id: 1, alias: 'a' },
      { id: 2, alias: 'b' }
    ];
    expect(reorderItemsByIds(items, [2, 1]).map(i => i.alias)).toEqual(['b', 'a']);
  });

  it('inserts after id or appends', () => {
    const items = [{ id: 1 }, { id: 2 }];
    insertItemAfter(items, { id: 3 }, 1);
    expect(items.map(i => i.id)).toEqual([1, 3, 2]);
    insertItemAfter(items, { id: 4 }, null);
    expect(items.map(i => i.id)).toEqual([1, 3, 2, 4]);
  });
});

describe('substitution', () => {
  it('applies alias mapping and drops originals', () => {
    const items = [
      {
        id: 1,
        alias: 'X1',
        definition_formal: 'X1',
        typification_manual: '',
        term_raw: 'a',
        definition_raw: '@{X1|nomn,sing}'
      },
      {
        id: 2,
        alias: 'X2',
        definition_formal: 'X2',
        typification_manual: '',
        term_raw: 'b',
        definition_raw: ''
      }
    ];
    const result = applyConstituentSubstitutions(
      items,
      [{ container: 1, attribute: 2 }],
      [{ original: 1, substitution: 2 }]
    );
    expect(result.deletedIds).toEqual(new Set([1]));
    expect(result.items).toHaveLength(1);
    expect(result.items[0].definition_raw).toBe('');
    expect(result.attributions).toEqual([]);
  });

  it('remaps substitutions after import', () => {
    expect(
      remapSubstitutionsAfterImport(
        [
          { original: 10, substitution: 1 },
          { original: 1, substitution: 10 }
        ],
        new Set([10]),
        { 10: 100 }
      )
    ).toEqual([
      { original: 100, substitution: 1 },
      { original: 1, substitution: 100 }
    ]);
  });
});
