import { describe, expect, it } from 'vitest';

import { Graph } from '../graph';
import { RSLangAnalyzer } from '../rslang/semantic/analyzer';
import { basic, bool, IntegerT } from '../rslang/semantic/typification';

import { getAnalysisFor } from './rsform-api/analysis';
import { buildFormalDependencyGraph } from './rsform-api/formal-graph';
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

function analyzedSchema(items: Constituenta[]): RSForm {
  const result = {
    id: 1,
    items,
    analyzer: new RSLangAnalyzer(),
    graph: buildFormalDependencyGraph(items),
    cstByAlias: new Map(items.map(item => [item.alias, item])),
    cstByID: new Map(items.map(item => [item.id, item]))
  } as RSForm;
  for (const item of items) {
    if (item.cst_type === CstType.BASE) {
      result.analyzer.addBase(item.alias);
    }
  }
  for (const item of items) {
    item.analysis = getAnalysisFor(item.definition_formal, item.cst_type, result, item.alias);
    item.effectiveType = item.analysis.type;
    result.analyzer.setGlobal(item.alias, item.analysis.type, item.analysis.valueClass);
  }
  return result;
}

function createEngine(): RSEngine {
  return new RSEngine(10, {
    setCstValue: () => Promise.resolve(),
    clearValues: () => Promise.resolve()
  });
}

describe('RSEngine.setBasicValue', () => {
  it('awaits setCstValue before clearValues when dependents must reset', async () => {
    const x1 = mockConstituenta({ id: 1, alias: 'X1', cst_type: CstType.BASE });
    const s1 = mockConstituenta({
      id: 2,
      alias: 'S1',
      cst_type: CstType.STRUCTURED,
      cst_class: CstClass.BASIC,
      // Non-number value cannot be reconciled with a basic domain shrink, so it must be cleared.
      effectiveType: basic('X1')
    });
    const order: string[] = [];
    let releaseSet!: () => void;
    const setGate = new Promise<void>(resolve => {
      releaseSet = resolve;
    });
    const engine = new RSEngine(10, {
      setCstValue: async () => {
        order.push('set-start');
        await setGate;
        order.push('set-end');
      },
      clearValues: () => {
        order.push('clear');
        return Promise.resolve();
      }
    });
    const schema = mockSchema([x1, s1]);
    schema.graph = new Graph([[1], [2], [1, 2]]);
    engine.loadData(
      schema,
      mockModel([
        { id: 1, type: TYPE_BASIC, value: { 1: 'a', 2: 'b' } },
        { id: 2, type: 'X1', value: [1, 2] }
      ])
    );

    const pending = engine.setBasicValue(1, { 9: 'only-new' });
    expect(order).toEqual(['set-start']);
    releaseSet();
    await pending;
    expect(order).toEqual(['set-start', 'set-end', 'clear']);
  });

  it('leaves dependents and the loaded model unchanged when the save is rejected', async () => {
    const x1 = mockConstituenta({ id: 1, alias: 'X1', cst_type: CstType.BASE });
    const s1 = mockConstituenta({
      id: 2,
      alias: 'S1',
      cst_type: CstType.STRUCTURED,
      effectiveType: bool(basic('X1'))
    });
    const model = mockModel([
      { id: 1, type: TYPE_BASIC, value: { 1: 'a', 2: 'b' } },
      { id: 2, type: 'ℬ(X1)', value: [1, 2] }
    ]);
    let started = false;
    const engine = new RSEngine(10, {
      setCstValue: () => {
        started = true;
        return Promise.reject(new Error('transport failed'));
      },
      clearValues: () => Promise.resolve()
    });
    const schema = mockSchema([x1, s1]);
    schema.graph = new Graph([[1], [2], [1, 2]]);
    engine.loadData(schema, model);

    const pending = engine.setBasicValue(1, { 1: 'a' });
    expect(started).toBe(true);
    expect(engine.getCstValue(1)).toEqual([1, 2]);
    expect(engine.getCstValue(2)).toEqual([1, 2]);
    expect(model.items[1]?.value).toEqual([1, 2]);
    await expect(pending).rejects.toThrow('transport failed');
    expect(engine.getCstValue(1)).toEqual([1, 2]);
    expect(engine.getCstValue(2)).toEqual([1, 2]);
    expect(model.items[1]?.value).toEqual([1, 2]);
  });

  it('applies the saved base update when the following clear fails', async () => {
    const x1 = mockConstituenta({ id: 1, alias: 'X1', cst_type: CstType.BASE });
    const s1 = mockConstituenta({
      id: 2,
      alias: 'S1',
      cst_type: CstType.STRUCTURED,
      effectiveType: basic('X1')
    });
    const engine = new RSEngine(10, {
      setCstValue: () => Promise.resolve(),
      clearValues: () => Promise.reject(new Error('clear failed'))
    });
    const schema = mockSchema([x1, s1]);
    schema.graph = new Graph([[1], [2], [1, 2]]);
    engine.loadData(
      schema,
      mockModel([
        { id: 1, type: TYPE_BASIC, value: { 1: 'a', 2: 'b' } },
        { id: 2, type: 'X1', value: [1, 2] }
      ])
    );

    await expect(engine.setBasicValue(1, { 9: 'only-new' })).rejects.toThrow('clear failed');
    expect(engine.getCstValue(1)).toEqual([9]);
    expect(engine.basics.get(1)).toEqual({ 9: 'only-new' });
    expect(engine.getCstValue(2)).toEqual([1, 2]);
    expect(engine.getCstStatus(2)).toBe(EvalStatus.INVALID_DATA);
  });

  it('loads negative basic identifiers in numeric order', () => {
    const schema = analyzedSchema([
      mockConstituenta({ id: 1, alias: 'X1', cst_type: CstType.BASE }),
      mockConstituenta({
        id: 2,
        alias: 'D1',
        cst_type: CstType.TERM,
        definition_formal: 'I{a | a:∈X1; a∈X1}'
      })
    ]);
    const engine = createEngine();
    engine.loadData(
      schema,
      mockModel([{ id: 1, type: TYPE_BASIC, value: { '-2': 'minus two', '-3': 'minus three' } }])
    );
    expect(engine.getCstValue(1)).toEqual([-3, -2]);
    expect(engine.calculateCst(2).value).toEqual([-3, -2]);
  });

  it('sorts negative identifiers before a membership check', async () => {
    const schema = analyzedSchema([
      mockConstituenta({ id: 1, alias: 'X1', cst_type: CstType.BASE }),
      mockConstituenta({
        id: 2,
        alias: 'D1',
        cst_type: CstType.TERM,
        definition_formal: 'I{a | a:∈X1; a∈X1}'
      })
    ]);
    const engine = createEngine();
    engine.loadData(schema, mockModel([{ id: 1, type: TYPE_BASIC, value: { 1: 'a' } }]));
    await engine.setBasicValue(1, { '-2': 'minus two', '-3': 'minus three' });
    expect(engine.getCstValue(1)).toEqual([-3, -2]);
    expect(engine.calculateCst(2).value).toEqual([-3, -2]);
  });
});

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

  it('loading an empty replacement model removes previous base values', () => {
    const schema = mockSchema([mockConstituenta({ id: 1, alias: 'X1', cst_type: CstType.BASE })]);
    const engine = createEngine();
    engine.loadData(schema, mockModel([{ id: 1, type: TYPE_BASIC, value: { 1: 'a' } }]));
    engine.loadData(schema, mockModel([]));
    expect(engine.basics.size).toBe(0);
    expect(engine.getCstValue(1)).toEqual([]);
  });

  it('moves a base value onto a renamed alias and drops a removed one', () => {
    const engine = createEngine();
    const original = mockSchema([
      mockConstituenta({ id: 1, alias: 'X1', cst_type: CstType.BASE }),
      mockConstituenta({ id: 2, alias: 'X2', cst_type: CstType.BASE })
    ]);
    const model = mockModel([
      { id: 1, type: TYPE_BASIC, value: { 1: 'a' } },
      { id: 2, type: TYPE_BASIC, value: { 2: 'b' } }
    ]);
    engine.loadData(original, model);
    const renamed = mockSchema([mockConstituenta({ id: 1, alias: 'X9', cst_type: CstType.BASE })]);
    engine.loadData(renamed, model);
    expect(engine.calculator.getValue('X1')).toBeNull();
    expect(engine.calculator.getValue('X2')).toBeNull();
    expect(engine.getCstValue(1)).toEqual([1]);
  });

  it('revalidates a structured value moved onto a renamed alias', () => {
    const engine = createEngine();
    const base = mockConstituenta({ id: 1, alias: 'X1', cst_type: CstType.BASE });
    const original = mockSchema([
      base,
      mockConstituenta({
        id: 2,
        alias: 'S1',
        cst_type: CstType.STRUCTURED,
        effectiveType: bool(basic('X1'))
      })
    ]);
    const model = mockModel([
      { id: 1, type: TYPE_BASIC, value: { 1: 'a' } },
      { id: 2, type: 'ℬ(X1)', value: [1] }
    ]);
    engine.loadData(original, model);
    expect(engine.getCstStatus(2)).toBe(EvalStatus.HAS_DATA);

    const retyped = mockSchema([
      base,
      mockConstituenta({
        id: 2,
        alias: 'S2',
        cst_type: CstType.STRUCTURED,
        effectiveType: IntegerT
      })
    ]);
    engine.loadData(retyped, model);
    expect(engine.calculator.getValue('S1')).toBeNull();
    expect(engine.getCstValue(2)).toEqual([1]);
    expect(engine.getCstStatus(2)).toBe(EvalStatus.INVALID_DATA);

    const restored = mockSchema([
      base,
      mockConstituenta({
        id: 2,
        alias: 'S3',
        cst_type: CstType.STRUCTURED,
        effectiveType: bool(basic('X1'))
      })
    ]);
    engine.loadData(restored, model);
    expect(engine.getCstValue(2)).toEqual([1]);
    expect(engine.getCstStatus(2)).toBe(EvalStatus.HAS_DATA);
  });

  it('marks a non-array structured value invalid instead of throwing', () => {
    const structured = mockConstituenta({
      id: 2,
      alias: 'S1',
      cst_type: CstType.STRUCTURED,
      effectiveType: bool(basic('X1'))
    });
    const engine = createEngine();
    const malformed = { unexpected: true } as unknown as RSModel['items'][number]['value'];

    expect(() =>
      engine.loadData(mockSchema([structured]), mockModel([{ id: 2, type: 'ℬ(X1)', value: malformed }]))
    ).not.toThrow();
    expect(engine.getCstStatus(2)).toBe(EvalStatus.INVALID_DATA);

    expect(() =>
      engine.loadData(
        mockSchema([structured]),
        mockModel([{ id: 2, type: 'ℬ(X1)', value: null as unknown as RSModel['items'][number]['value'] }])
      )
    ).not.toThrow();
    expect(engine.getCstStatus(2)).toBe(EvalStatus.INVALID_DATA);
  });
});

describe('RSEngine.resetValue', () => {
  it('invalidates calculated dependents of a reset input', async () => {
    const schema = analyzedSchema([
      mockConstituenta({ id: 1, alias: 'X1', cst_type: CstType.BASE }),
      mockConstituenta({ id: 2, alias: 'D1', cst_type: CstType.TERM, definition_formal: 'card(X1)' })
    ]);
    const engine = createEngine();
    engine.loadData(schema, mockModel([{ id: 1, type: TYPE_BASIC, value: { 1: 'a' } }]));
    expect(engine.calculateCst(2).value).toBe(1);
    await engine.resetValue(1);
    expect(engine.getCstStatus(2)).toBe(EvalStatus.NOT_PROCESSED);
    expect(engine.getCstValue(2)).toBeNull();
  });
});
