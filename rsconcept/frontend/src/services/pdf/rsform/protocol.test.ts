import { describe, expect, it } from 'vitest';

import { Graph } from '@rsconcept/domain/graph';
import { type Constituenta, CstClass, CstType, type RSForm } from '@rsconcept/domain/library';

import { toConstituentaPdfRow, toSchemaPdfInput } from './protocol';

function mockConstituenta(): Constituenta {
  return {
    id: 7,
    schema: 1,
    crucial: false,
    alias: 'X1',
    convention: 'note',
    definition_formal: '[α∈ℬ(R)]',
    definition_raw: 'raw',
    definition_resolved: 'resolved',
    term_raw: 'raw term',
    term_resolved: 'term',
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
    attributes: [1, 2],
    spawn: [9],
    spawn_alias: ['X9'],
    cst_class: CstClass.BASIC,
    cst_type: CstType.BASE
  };
}

describe('rsform PDF protocol DTOs', () => {
  it('keeps only PDF table fields on constituenta rows', () => {
    const row = toConstituentaPdfRow(mockConstituenta());

    expect(row).toEqual({
      id: 7,
      alias: 'X1',
      definition_formal: '[α∈ℬ(R)]',
      typification: 'N/A',
      term_resolved: 'term',
      definition_resolved: 'resolved',
      convention: 'note'
    });
    expect(row).not.toHaveProperty('diagnostics');
    expect(row).not.toHaveProperty('analysis');
    expect(row).not.toHaveProperty('spawn');
  });

  it('drops non-cloneable schema fields when building SchemaPdfInput', () => {
    const items = [mockConstituenta()];
    const schema = {
      id: 3,
      title: 'T',
      alias: 'S1',
      items,
      graph: new Graph([[7]]),
      analyzer: { unused: true }
    } as unknown as RSForm;

    const input = toSchemaPdfInput(schema);

    expect(input).toEqual({
      id: 3,
      title: 'T',
      alias: 'S1',
      items: [toConstituentaPdfRow(items[0])]
    });
    expect(input).not.toHaveProperty('graph');
    expect(input).not.toHaveProperty('analyzer');
  });
});
