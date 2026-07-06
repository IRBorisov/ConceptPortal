import { describe, expect, it } from 'vitest';

import { type Constituenta, CstClass, CstType, type RSForm } from '@rsconcept/domain/library';

import { buildCloneConstituentsBatch } from './build-clone-batch';

function mockSchema(items: Constituenta[]): RSForm {
  return { items } as RSForm;
}

function mockCst(partial: Pick<Constituenta, 'id' | 'alias'> & Partial<Constituenta>): Constituenta {
  return {
    schema: 1,
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
    cst_type: CstType.BASE,
    cst_class: CstClass.BASIC,
    definition_formal: '',
    ...partial
  };
}

describe('buildCloneConstituentsBatch', () => {
  it('remaps formal expressions and terminological references between cloned constituents', () => {
    const schema = mockSchema([
      mockCst({
        id: 1,
        alias: 'X1',
        definition_formal: 'X1 = X2',
        typification_manual: 'ℬ(X1)',
        term_raw: '@{X1|sing}',
        definition_raw: '@{X2|sing}'
      }),
      mockCst({
        id: 2,
        alias: 'X2',
        definition_formal: 'X2 = X1',
        term_raw: '@{X2|sing}',
        definition_raw: '@{X1|sing}'
      }),
      mockCst({
        id: 3,
        alias: 'X3',
        definition_formal: 'X3 = X1'
      })
    ]);

    const batch = buildCloneConstituentsBatch(schema, [1, 2], 3);

    expect(batch.insert_after).toBe(3);
    expect(batch.items).toHaveLength(2);
    expect(batch.items[0].alias).toBe('X4');
    expect(batch.items[1].alias).toBe('X5');
    expect(batch.items[0].definition_formal).toBe('X4 = X5');
    expect(batch.items[1].definition_formal).toBe('X5 = X4');
    expect(batch.items[0].term_raw).toBe('@{X4|sing}');
    expect(batch.items[0].definition_raw).toBe('@{X5|sing}');
    expect(batch.items[1].term_raw).toBe('@{X5|sing}');
    expect(batch.items[1].definition_raw).toBe('@{X4|sing}');
    expect(batch.items[0].typification_manual).toBe('ℬ(X4)');
  });

  it('keeps references to constituents outside the cloned set unchanged', () => {
    const schema = mockSchema([
      mockCst({
        id: 1,
        alias: 'X1',
        definition_formal: 'X1 = X2'
      }),
      mockCst({
        id: 2,
        alias: 'X2',
        definition_formal: 'X2 = X1'
      })
    ]);

    const batch = buildCloneConstituentsBatch(schema, [1], null);

    expect(batch.insert_after).toBeNull();
    expect(batch.items).toHaveLength(1);
    expect(batch.items[0].alias).toBe('X3');
    expect(batch.items[0].definition_formal).toBe('X3 = X2');
  });
});
