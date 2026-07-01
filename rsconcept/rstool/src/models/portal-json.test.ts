import { describe, expect, it } from 'vitest';

import { CstType } from './common';
import { portalItemToDraft } from './portal-json';

describe('portalItemToDraft', () => {
  it('maps valid portal items', () => {
    expect(
      portalItemToDraft({
        id: 1,
        alias: 'D1',
        cst_type: CstType.TERM,
        definition_formal: '1+2',
        term_raw: 'term',
        definition_raw: 'def',
        convention: 'conv'
      })
    ).toEqual({
      id: 1,
      alias: 'D1',
      cstType: CstType.TERM,
      definitionFormal: '1+2',
      term: 'term',
      definitionText: 'def',
      convention: 'conv'
    });
  });

  it('rejects unknown cst_type values', () => {
    expect(() =>
      portalItemToDraft({
        id: 1,
        alias: 'X1',
        cst_type: 'not-a-cst-type'
      })
    ).toThrow(/Invalid cst_type "not-a-cst-type" for constituent "X1"/);
  });
});
