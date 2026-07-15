import { describe, expect, it } from 'vitest';

import { type Constituenta, CstClass, CstType } from '@rsconcept/domain/library';

import { CST_MATCH_RANK, cstMatchRank, filterConstituentaByQuery } from './rsform-search';

function mockCst(partial: Pick<Constituenta, 'id' | 'alias' | 'cst_type'> & Partial<Constituenta>): Constituenta {
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
    cst_class: CstClass.BASIC,
    definition_formal: '',
    ...partial
  };
}

describe('cstMatchRank', () => {
  const base = mockCst({
    id: 1,
    alias: 'X1',
    cst_type: CstType.BASE,
    term_resolved: 'множество',
    definition_formal: 'ℬ(U1)',
    definition_resolved: 'базовое множество',
    convention: 'общая конвенция'
  });

  const derived = mockCst({
    id: 2,
    alias: 'P1',
    cst_type: CstType.PREDICATE,
    term_resolved: 'свойство',
    definition_formal: 'Pr1(X1)',
    definition_resolved: 'предикат',
    convention: 'пояснение разработчика'
  });

  it('ranks alias above other fields', () => {
    expect(cstMatchRank(base, 'X1')).toBe(CST_MATCH_RANK.alias);
    expect(cstMatchRank(derived, 'P1')).toBe(CST_MATCH_RANK.alias);
  });

  it('ranks term above definitions', () => {
    expect(cstMatchRank(base, 'множество')).toBe(CST_MATCH_RANK.term);
  });

  it('ranks formal definition above text definition', () => {
    expect(cstMatchRank(base, 'базовое')).toBe(CST_MATCH_RANK.textDefinition);
    expect(cstMatchRank(derived, 'Pr1')).toBe(CST_MATCH_RANK.formalDefinition);
  });

  it('ranks convention for basic concepts and comment for derived', () => {
    expect(cstMatchRank(base, 'конвенция')).toBe(CST_MATCH_RANK.convention);
    expect(cstMatchRank(derived, 'разработчика')).toBe(CST_MATCH_RANK.comment);
  });

  it('returns null when there is no match', () => {
    expect(cstMatchRank(base, 'missing')).toBeNull();
    expect(cstMatchRank(base, '')).toBeNull();
  });

  it('matches formal expression pastes via plain-text fallback when regexp does not', () => {
    const typed = mockCst({
      id: 3,
      alias: 'F1',
      cst_type: CstType.FUNCTION,
      definition_formal: '[α∈ℬ(R1)×ℬ(C1)] Pr1(α)'
    });

    expect(cstMatchRank(typed, 'ℬ(R1)×ℬ(C1)')).toBe(CST_MATCH_RANK.formalDefinition);
    expect(cstMatchRank(typed, 'ℬ(R1)')).toBe(CST_MATCH_RANK.formalDefinition);
  });

  it('still supports regexp queries', () => {
    const typed = mockCst({
      id: 4,
      alias: 'F12',
      cst_type: CstType.FUNCTION,
      definition_formal: 'Pr1(X1)'
    });

    expect(cstMatchRank(typed, String.raw`F\d+`)).toBe(CST_MATCH_RANK.alias);
  });
});

describe('filterConstituentaByQuery', () => {
  const items = [
    mockCst({
      id: 1,
      alias: 'A1',
      cst_type: CstType.BASE,
      definition_resolved: 'alpha match'
    }),
    mockCst({
      id: 2,
      alias: 'B2',
      cst_type: CstType.BASE,
      term_resolved: 'alpha term'
    }),
    mockCst({
      id: 3,
      alias: 'C3',
      cst_type: CstType.BASE,
      definition_formal: 'alpha formal'
    })
  ];

  it('sorts by relevance and keeps schema order for ties', () => {
    expect(filterConstituentaByQuery(items, 'alpha').map(cst => cst.id)).toEqual([2, 3, 1]);
  });

  it('returns original list when query is empty', () => {
    expect(filterConstituentaByQuery(items, '')).toBe(items);
    expect(filterConstituentaByQuery(items, '   ')).toBe(items);
  });
});
