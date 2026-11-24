import { describe, expect, it } from 'vitest';

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
});
