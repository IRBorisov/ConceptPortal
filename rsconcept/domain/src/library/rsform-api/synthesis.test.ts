import { describe, expect, it } from 'vitest';

import { CstType } from '../rsform';

import { inlineSynthesis } from './synthesis';

function item(partial: {
  id: number;
  alias: string;
  cst_type: CstType;
  definition_formal?: string;
  term_raw?: string;
  definition_raw?: string;
}) {
  return {
    id: partial.id,
    alias: partial.alias,
    cst_type: partial.cst_type,
    definition_formal: partial.definition_formal ?? '',
    typification_manual: '',
    term_raw: partial.term_raw ?? '',
    term_resolved: partial.term_raw ?? '',
    term_forms: [] as { text: string; tags: string }[],
    definition_raw: partial.definition_raw ?? '',
    definition_resolved: partial.definition_raw ?? ''
  };
}

describe('inlineSynthesis', () => {
  it('keeps source aliases when receiver is empty', () => {
    const result = inlineSynthesis({
      receiverItems: [],
      sourceItems: [item({ id: 10, alias: 'X9', cst_type: CstType.BASE, term_raw: 'person' })],
      nextId: 1
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].alias).toBe('X9');
    expect(result.items[0].id).toBe(1);
    expect(result.idMap).toEqual({ 10: 1 });
    expect(result.nextId).toBe(2);
    expect(result.aliasMapping).toEqual({});
  });

  it('allocates fresh aliases when receiver is non-empty', () => {
    const result = inlineSynthesis({
      receiverItems: [item({ id: 1, alias: 'X2', cst_type: CstType.BASE })],
      sourceItems: [item({ id: 10, alias: 'X9', cst_type: CstType.BASE, term_raw: 'source' })],
      nextId: 100
    });

    expect(result.items).toHaveLength(2);
    expect(result.items[1].alias).toBe('X3');
    expect(result.items[1].id).toBe(100);
    expect(result.aliasMapping).toEqual({ X9: 'X3' });
  });

  it('applies substitutions after import (source original → receiver survivor)', () => {
    const result = inlineSynthesis({
      receiverItems: [item({ id: 1, alias: 'X1', cst_type: CstType.BASE, term_raw: 'keep' })],
      sourceItems: [
        item({
          id: 20,
          alias: 'X1',
          cst_type: CstType.BASE,
          term_raw: 'drop',
          definition_formal: ''
        })
      ],
      substitutions: [{ original: 20, substitution: 1 }],
      nextId: 50
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe(1);
    expect(result.items[0].term_raw).toBe('keep');
    expect(result.deletedIds).toEqual(new Set([50]));
    expect(result.replacementIds).toEqual([1]);
  });

  it('remaps formal references when importing into non-empty receiver', () => {
    const result = inlineSynthesis({
      receiverItems: [item({ id: 1, alias: 'X1', cst_type: CstType.BASE })],
      sourceItems: [
        item({ id: 10, alias: 'X1', cst_type: CstType.BASE }),
        item({
          id: 11,
          alias: 'S1',
          cst_type: CstType.STRUCTURED,
          definition_formal: 'ℬ(X1)'
        })
      ],
      nextId: 2
    });

    const structured = result.items.find(cst => cst.cst_type === CstType.STRUCTURED)!;
    expect(structured.alias).toBe('S1');
    expect(structured.definition_formal).toBe('ℬ(X2)');
  });

  it('imports attributions with id remapping', () => {
    const result = inlineSynthesis({
      receiverItems: [item({ id: 1, alias: 'X1', cst_type: CstType.BASE })],
      receiverAttributions: [],
      sourceItems: [
        item({ id: 10, alias: 'X1', cst_type: CstType.BASE }),
        item({ id: 11, alias: 'S1', cst_type: CstType.STRUCTURED })
      ],
      sourceAttributions: [{ container: 10, attribute: 11 }],
      nextId: 2
    });

    expect(result.attributions).toEqual([{ container: 2, attribute: 3 }]);
  });

  it('returns a clone when source is empty', () => {
    const receiver = [item({ id: 1, alias: 'X1', cst_type: CstType.BASE })];
    const result = inlineSynthesis({
      receiverItems: receiver,
      sourceItems: [],
      nextId: 2
    });
    expect(result.items).toEqual(receiver);
    expect(result.items).not.toBe(receiver);
  });
});
