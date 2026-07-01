import { describe, expect, it } from 'vitest';

import { CstType } from '../models';
import { orderDrafts } from './batch-apply';

const baseItem = {
  id: 1,
  alias: 'X1',
  cstType: CstType.BASE,
  definitionFormal: '',
  term: '',
  definitionText: '',
  convention: '',
  analysis: { success: true, type: null, valueClass: 'value' as const, diagnostics: [] }
};

describe('orderDrafts', () => {
  it('orders dependents after suppliers', () => {
    const ordered = orderDrafts(
      [baseItem],
      [
        { id: 3, alias: 'D1', cstType: CstType.TERM, definitionFormal: 'Pr1(S1)' },
        { id: 2, alias: 'S1', cstType: CstType.STRUCTURED, definitionFormal: 'ℬ(X1×X1)' }
      ]
    );
    expect(ordered.map(draft => draft.alias)).toEqual(['S1', 'D1']);
  });

  it('orders multi-hop chains X1 → S1 → D1', () => {
    const ordered = orderDrafts(
      [baseItem],
      [
        { id: 4, alias: 'D1', cstType: CstType.TERM, definitionFormal: 'Pr1(S1)' },
        { id: 3, alias: 'S1', cstType: CstType.STRUCTURED, definitionFormal: 'ℬ(X1×X1)' },
        { id: 2, alias: 'C1', cstType: CstType.CONSTANT, definitionFormal: '' }
      ]
    );
    expect(ordered.map(draft => draft.alias)).toEqual(['C1', 'S1', 'D1']);
  });

  it('orders draft that only references existing session items', () => {
    const ordered = orderDrafts(
      [
        baseItem,
        {
          id: 2,
          alias: 'S1',
          cstType: CstType.STRUCTURED,
          definitionFormal: 'ℬ(X1×X1)',
          term: '',
          definitionText: '',
          convention: '',
          analysis: { success: true, type: null, valueClass: 'value', diagnostics: [] }
        }
      ],
      [{ id: 3, alias: 'D1', cstType: CstType.TERM, definitionFormal: 'Pr1(S1)' }]
    );
    expect(ordered.map(draft => draft.alias)).toEqual(['D1']);
  });

  it('appends cyclic drafts after topological ids', () => {
    const ordered = orderDrafts(
      [],
      [
        { id: 1, alias: 'D1', cstType: CstType.TERM, definitionFormal: 'D2' },
        { id: 2, alias: 'D2', cstType: CstType.TERM, definitionFormal: 'D1' }
      ]
    );
    expect(ordered.map(draft => draft.alias).sort()).toEqual(['D1', 'D2']);
    expect(ordered).toHaveLength(2);
  });

  it('returns all independent drafts', () => {
    const ordered = orderDrafts(
      [],
      [
        { id: 1, alias: 'C1', cstType: CstType.CONSTANT, definitionFormal: '' },
        { id: 2, alias: 'C2', cstType: CstType.CONSTANT, definitionFormal: '' }
      ]
    );
    expect(ordered.map(draft => draft.alias).sort()).toEqual(['C1', 'C2']);
    expect(ordered).toHaveLength(2);
  });
});
