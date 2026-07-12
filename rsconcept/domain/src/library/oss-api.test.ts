import { describe, expect, it } from 'vitest';

import { Graph } from '../graph';

import { SubstitutionErrorType } from './oss';
import { SubstitutionValidator } from './oss-api';
import { type Constituenta, CstClass, CstType, type RSForm } from './rsform';

function mockConstituenta(
  partial: Pick<Constituenta, 'id' | 'alias' | 'definition_formal' | 'cst_class' | 'cst_type'> &
    Partial<Pick<Constituenta, 'schema'>>
): Constituenta {
  return {
    schema: partial.schema ?? 790,
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

function mockSchema(items: Constituenta[], edges: number[][] = [], id = 790, alias = 'S1'): RSForm {
  const graph = new Graph(items.map(item => [item.id]));
  for (const edge of edges) {
    if (edge.length === 2) {
      graph.addEdge(edge[0], edge[1]);
    }
  }
  return {
    id,
    alias,
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

  it('reports definitionCycle when identification closes a formal dependency loop', () => {
    // D16 := F2[D15]  ⇒ edge D15 → D16; identifying D15 → D16 yields D16 := F2[D16]
    const schema = mockSchema(
      [
        mockConstituenta({
          id: 1,
          alias: 'X1',
          cst_class: CstClass.BASIC,
          cst_type: CstType.BASE,
          definition_formal: ''
        }),
        mockConstituenta({
          id: 2,
          alias: 'F2',
          cst_class: CstClass.DERIVED,
          cst_type: CstType.FUNCTION,
          definition_formal: '[α∈X1] α'
        }),
        mockConstituenta({
          id: 3,
          alias: 'D15',
          cst_class: CstClass.DERIVED,
          cst_type: CstType.TERM,
          definition_formal: 'X1'
        }),
        mockConstituenta({
          id: 4,
          alias: 'D16',
          cst_class: CstClass.DERIVED,
          cst_type: CstType.TERM,
          definition_formal: 'F2[D15]'
        })
      ],
      [
        [2, 4],
        [3, 4]
      ]
    );

    const validator = new SubstitutionValidator([schema], [{ original: 3, substitution: 4 }]);

    expect(validator.validate()).toBe(false);
    expect(validator.errors).toEqual([
      {
        code: SubstitutionErrorType.definitionCycle,
        params: ['D16 → D16']
      }
    ]);
    expect(SubstitutionErrorType.definitionCycle).toBe(0x8906);
  });

  it('allows identification that does not create a definition cycle', () => {
    const schema = mockSchema(
      [
        mockConstituenta({
          id: 1,
          alias: 'X1',
          cst_class: CstClass.BASIC,
          cst_type: CstType.BASE,
          definition_formal: ''
        }),
        mockConstituenta({
          id: 2,
          alias: 'D1',
          cst_class: CstClass.DERIVED,
          cst_type: CstType.TERM,
          definition_formal: 'X1'
        }),
        mockConstituenta({
          id: 3,
          alias: 'D2',
          cst_class: CstClass.DERIVED,
          cst_type: CstType.TERM,
          definition_formal: 'X1'
        })
      ],
      [
        [1, 2],
        [1, 3]
      ]
    );

    const validator = new SubstitutionValidator([schema], [{ original: 2, substitution: 3 }]);

    expect(validator.validate()).toBe(true);
    expect(validator.errors.every(error => error.code !== SubstitutionErrorType.definitionCycle)).toBe(true);
  });
});
