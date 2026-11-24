import { describe, expect, it } from 'vitest';

import { globalTx } from '@/i18n';
import { CstType } from '@rsconcept/domain/library';

import { makeRelativizedData } from './make-data';

describe('makeRelativizedData', () => {
  it('builds the selected context and converts the function parameters to it', () => {
    const fields = {
      convention: '',
      crucial: false,
      value_is_property: false,
      typification_manual: '',
      definition_formal: '',
      definition_raw: '',
      definition_resolved: '',
      term_raw: '',
      term_resolved: '',
      term_forms: []
    };
    const source = {
      items: [
        { ...fields, id: 1, alias: 'X1', cst_type: CstType.BASE },
        { ...fields, id: 2, alias: 'S4', cst_type: CstType.STRUCTURED, definition_formal: 'ℬ(X1×X1)' },
        { ...fields, id: 3, alias: 'F1', cst_type: CstType.FUNCTION, definition_formal: '[a∈X1] {(a,a)}∩S4' }
      ],
      attribution: []
    };

    const result = makeRelativizedData(source, 'S4', ['X1']);

    expect(result?.items.find(item => item.cst_type === CstType.FUNCTION)?.definition_formal).toBe(
      '[c∈S1, a∈X1] {(a,a)}∩c'
    );
    expect(makeRelativizedData(source, 'F1', [])).toBeNull();
  });

  it('clears a manual type only when the formal changes type, and localizes the accessor', () => {
    const fields = {
      convention: '',
      crucial: false,
      value_is_property: false,
      typification_manual: '',
      definition_formal: '',
      definition_raw: '',
      definition_resolved: '',
      term_raw: '',
      term_resolved: '',
      term_forms: []
    };
    const source = {
      items: [
        { ...fields, id: 1, alias: 'X1', cst_type: CstType.BASE, typification_manual: 'X1' },
        {
          ...fields,
          id: 2,
          alias: 'S1',
          cst_type: CstType.STRUCTURED,
          definition_formal: 'ℬ(X1)',
          typification_manual: 'ℬ(X1)'
        },
        {
          ...fields,
          id: 3,
          alias: 'D1',
          cst_type: CstType.TERM,
          definition_formal: 'S1',
          typification_manual: 'ℬ(X1)'
        },
        {
          ...fields,
          id: 4,
          alias: 'S2',
          cst_type: CstType.STRUCTURED,
          definition_formal: 'ℬ(X1)',
          typification_manual: 'ℬ(X1)'
        }
      ],
      attribution: []
    };

    const result = makeRelativizedData(source, 'X1', ['S2']);

    expect(result).not.toBeNull();
    const items = result?.items ?? [];
    expect(items.find(item => item.cst_type === CstType.BASE)?.typification_manual).not.toBe('');
    expect(items.find(item => item.alias === 'S2')?.typification_manual).not.toBe('');
    expect(items.find(item => item.cst_type === CstType.TERM)?.typification_manual).toBe('');
    expect(
      items
        .filter(item => item.cst_type === CstType.STRUCTURED && item.definition_formal.includes('×'))
        .every(item => item.typification_manual === '')
    ).toBe(true);
    const accessor = items.find(item => item.cst_type === CstType.FUNCTION);
    expect(accessor?.term_raw).toBe(globalTx('tx.oss.relativization.accessor.term'));
    expect(accessor?.convention).toBe(globalTx('tx.oss.relativization.accessor.convention'));
    expect(accessor?.definition_formal).not.toMatch(/\p{Script=Cyrillic}/u);
  });
});
