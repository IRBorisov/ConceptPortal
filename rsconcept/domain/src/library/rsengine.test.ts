import { describe, expect, it } from 'vitest';

import { Graph } from '../graph';
import { RSLangAnalyzer } from '../rslang/semantic/analyzer';

import { RSEngine } from './rsengine';
import { type Constituenta, CstClass, CstType, type RSForm } from './rsform';
import { EvalStatus, type RSModel, TYPE_BASIC } from './rsmodel';

function mockConstituenta(
  partial: Pick<Constituenta, 'id' | 'alias' | 'cst_type'> & Partial<Constituenta>
): Constituenta {
  return {
    schema: 1,
    crucial: false,
    convention: '',
    definition_formal: '',
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
    ...partial
  };
}

function mockSchema(items: Constituenta[]): RSForm {
  const analyzer = new RSLangAnalyzer();
  for (const item of items) {
    if (item.cst_type === CstType.BASE) {
      analyzer.addBase(item.alias);
    }
  }
  return {
    id: 1,
    items,
    analyzer,
    graph: new Graph(items.map(item => [item.id])),
    cstByAlias: new Map(items.map(item => [item.alias, item])),
    cstByID: new Map(items.map(item => [item.id, item]))
  } as RSForm;
}

function mockModel(items: RSModel['items']): RSModel {
  return { id: 10, schema: 1, items } as RSModel;
}

function createEngine(): RSEngine {
  return new RSEngine(10, {
    setCstValue: () => Promise.resolve(),
    clearValues: () => Promise.resolve()
  });
}

describe('RSEngine.loadData', () => {
  it('applies basic bindings for constituents that exist in the schema', () => {
    const x1 = mockConstituenta({ id: 1, alias: 'X1', cst_type: CstType.BASE });
    const engine = createEngine();

    engine.loadData(mockSchema([x1]), mockModel([{ id: 1, type: TYPE_BASIC, value: { 1: 'a', 2: 'b' } }]));

    expect(engine.basics.get(1)).toEqual({ 1: 'a', 2: 'b' });
    expect(engine.getCstValue(1)).toEqual([1, 2]);
  });

  it('skips value items whose constituent is missing from the schema', () => {
    const x1 = mockConstituenta({ id: 1, alias: 'X1', cst_type: CstType.BASE });
    const engine = createEngine();

    expect(() =>
      engine.loadData(
        mockSchema([x1]),
        mockModel([
          { id: 1, type: TYPE_BASIC, value: { 1: 'a' } },
          { id: 35772, type: 'ℬ(X1)', value: [1] }
        ])
      )
    ).not.toThrow();

    expect(engine.basics.get(1)).toEqual({ 1: 'a' });
    expect(engine.getCstValue(1)).toEqual([1]);
    expect(engine.getCstValue(35772)).toBeNull();
  });

  it('skips basic bindings attached to a non-base constituent', () => {
    const s1 = mockConstituenta({
      id: 2,
      alias: 'S1',
      cst_type: CstType.STRUCTURED,
      cst_class: CstClass.BASIC
    });
    const engine = createEngine();

    expect(() =>
      engine.loadData(mockSchema([s1]), mockModel([{ id: 2, type: TYPE_BASIC, value: { 1: 'a' } }]))
    ).not.toThrow();

    expect(engine.basics.size).toBe(0);
    expect(engine.getCstStatus(2)).toBe(EvalStatus.INVALID_DATA);
  });
});
