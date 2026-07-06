import { describe, expect, it } from 'vitest';

import { Graph } from '../graph';

import { SubstitutionValidator } from './oss-api';
import { type Constituenta, CstClass, CstType, type RSForm } from './rsform';

function mockConstituenta(
  partial: Pick<Constituenta, 'id' | 'alias' | 'definition_formal' | 'cst_class' | 'cst_type'>
): Constituenta {
  return {
    schema: 790,
    crucial: false,
    convention: '',
    definition_raw: '',
    definition_resolved: '',
    term_raw: '',
    term_resolved: '',
    term_forms: [],
    typification_manual: '',
    value_is_property: false,
    diagnostics: [],
    analysis: { success: true } as Constituenta['analysis'],
    effectiveType: null,
    is_type_mismatch: false,
    status: 'verified',
    is_template: false,
    is_simple_expression: true,
    parent_schema_index: 0,
    parent_schema: null,
    is_inherited: false,
    has_inherited_children: false,
    attributes: [],
    spawn: [],
    spawn_alias: [],
    ...partial
  };
}

function mockSchema(items: Constituenta[]): RSForm {
  const graph = new Graph(items.map(item => [item.id]));
  return {
    id: 790,
    alias: 'S1',
    items,
    graph,
    cstByAlias: new Map(items.map(item => [item.alias, item]))
  } as RSForm;
}

describe('SubstitutionValidator', () => {
  it('validate does not throw when substitutions table is empty', () => {
    const schema = mockSchema([
      mockConstituenta({
        id: 1,
        alias: 'X1',
        cst_class: CstClass.BASIC,
        cst_type: CstType.BASE,
        definition_formal: ''
      }),
      mockConstituenta({
        id: 2,
        alias: 'D4',
        cst_class: CstClass.DERIVED,
        cst_type: CstType.TERM,
        definition_formal: 'D4'
      })
    ]);

    const validator = new SubstitutionValidator([schema], []);

    expect(() => validator.validate()).not.toThrow();
    expect(validator.validate()).toBe(true);
  });
});
