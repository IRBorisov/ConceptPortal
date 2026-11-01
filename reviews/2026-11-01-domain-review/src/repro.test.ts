import { describe, expect, it } from '../../../rsconcept/domain/node_modules/vitest/dist/index.js';
import { Graph } from '../../../rsconcept/domain/src/graph/graph';
import { RSEngine, type RSEngineServices } from '../../../rsconcept/domain/src/library/rsengine';
import { CstType, type Constituenta, type RSForm } from '../../../rsconcept/domain/src/library/rsform';
import { buildFormalDependencyGraph } from '../../../rsconcept/domain/src/library/rsform-api/formal-graph';
import { getAnalysisFor } from '../../../rsconcept/domain/src/library/rsform-api/analysis';
import { EvalStatus, TYPE_BASIC, type RSModel } from '../../../rsconcept/domain/src/library/rsmodel';
import { planTemplateInstantiation } from '../../../rsconcept/domain/src/library/template-instantiation';
import { RSLangAnalyzer } from '../../../rsconcept/domain/src/rslang/semantic/analyzer';
import { IntegerT, basic, bool, tuple } from '../../../rsconcept/domain/src/rslang/semantic/typification';
import { parseTypeText } from '../../../rsconcept/domain/src/rslang/semantic/typification-parser';
import { labelType } from '../../../rsconcept/domain/src/rslang/labels';
import { RSCalculator } from '../../../rsconcept/domain/src/rslang/eval/calculator';
import { validateValue } from '../../../rsconcept/domain/src/rslang/eval/value-api';
import { parseRSLangExpression } from '../../../rsconcept/domain/src/rslang/api';
import { RSErrorCode } from '../../../rsconcept/domain/src/rslang/error';
import { detectDependencyCycleDiagnostics } from '../../../rsconcept/domain/src/library/diagnostics';
import { calculateSchemaStats } from '../../../rsconcept/domain/src/library/rsform-api/stats';

function cst(id: number, alias: string, cst_type: CstType, definition_formal = ''): Constituenta {
  return { id, alias, cst_type, definition_formal, schema: 1, effectiveType: null,
    typification_manual: '', term_raw: '', term_forms: [], definition_raw: '',
    crucial: false, convention: '', value_is_property: false } as Constituenta;
}
function schema(items: Constituenta[]): RSForm {
  const result = { id: 1, items, analyzer: new RSLangAnalyzer(),
    graph: buildFormalDependencyGraph(items),
    cstByID: new Map(items.map(x => [x.id, x])),
    cstByAlias: new Map(items.map(x => [x.alias, x])) } as RSForm;
  for (const item of items) {
    if (item.cst_type === CstType.BASE) result.analyzer.addBase(item.alias);
    item.analysis = getAnalysisFor(item.definition_formal, item.cst_type, result, item.alias);
    item.effectiveType = item.analysis.type;
    result.analyzer.setGlobal(item.alias, item.analysis.type, item.analysis.valueClass);
  }
  return result;
}
function model(items: RSModel['items']): RSModel { return { id: 10, schema: 1, items } as RSModel; }
function engine(services?: Partial<RSEngineServices>) {
  return new RSEngine(10, { setCstValue: async () => {}, clearValues: async () => {}, ...services });
}

describe('Independent domain review regressions, expected behavior', () => {
  it('graph detects an edge whose destination is zero', () => {
    const graph = new Graph([[1, 0]]);
    expect.soft(graph.hasEdge(1, 0)).toBe(true);
    graph.addEdge(1, 0);
    expect(graph.at(1)?.outputs).toEqual([0]);
  });

  it('loading an empty replacement model removes previous base values', () => {
    const s = schema([cst(1, 'X1', CstType.BASE)]);
    const e = engine();
    e.loadData(s, model([{ id: 1, type: TYPE_BASIC, value: { 1: 'a' } }]));
    e.loadData(s, model([]));
    expect(e.basics.size).toBe(0);
    expect(e.getCstValue(1)).toEqual([]);
  });

  it('resetting an input invalidates calculated dependents', async () => {
    const s = schema([cst(1, 'X1', CstType.BASE), cst(2, 'D1', CstType.TERM, 'card(X1)')]);
    const e = engine();
    e.loadData(s, model([{ id: 1, type: TYPE_BASIC, value: { 1: 'a' } }]));
    expect(e.calculateCst(2).value).toBe(1);
    await e.resetValue(1);
    expect.soft(e.getCstStatus(2)).toBe(EvalStatus.NOT_PROCESSED);
    expect(e.getCstValue(2)).toBeNull();
  });

  it('a rejected base update preserves dependent data and the loaded model', async () => {
    const s = schema([cst(1, 'X1', CstType.BASE), cst(2, 'S1', CstType.STRUCTURED, 'ℬ(X1)')]);
    const e = engine({ setCstValue: async () => { throw new Error('transport failed'); } });
    const m = model([{ id: 1, type: TYPE_BASIC, value: { 1: 'a', 2: 'b' } },
      { id: 2, type: 'ℬ(X1)', value: [1, 2] }]);
    e.loadData(s, m);
    expect(e.getCstStatus(2)).toBe(EvalStatus.HAS_DATA);
    await expect(e.setBasicValue(1, { 1: 'a' })).rejects.toThrow('transport failed');
    expect.soft(e.getCstValue(2)).toEqual([1, 2]);
    expect(m.items[1].value).toEqual([1, 2]);
  });

  it('a set containing negative integer identifiers supports membership', () => {
    const s = schema([cst(1, 'X1', CstType.BASE), cst(2, 'D1', CstType.TERM, 'I{a | a:∈X1; a∈X1}')]);
    const e = engine();
    e.loadData(s, model([{ id: 1, type: TYPE_BASIC, value: { '-2': 'minus two', '-3': 'minus three' } }]));
    expect(e.calculateCst(2).value).toEqual([-3, -2]);
  });

  it('a valid integer typification rejects fractional and nonfinite numbers', () => {
    expect.soft(validateValue(1.5, IntegerT, new Map())).toBe(false);
    expect.soft(validateValue(NaN, IntegerT, new Map())).toBe(false);
    expect.soft(validateValue(Infinity, IntegerT, new Map())).toBe(false);
  });

  it('iteration exhaustion cannot produce a usable partial imperative result', () => {
    const calc = new RSCalculator();
    calc.setValue('X1', Array.from({ length: 1001 }, (_, i) => i));
    const ast = parseRSLangExpression('I{a | a:∈X1; b:∈X1; a=1000}')!;
    expect(ast.hasError).toBe(false);
    const result = calc.evaluateFull(ast);
    expect(result.errors.some(x => x.code === RSErrorCode.iterationsLimit)).toBe(true);
    expect(result.value).toBeNull();
  });

  it('typification text round trips a product beginning with a collection', () => {
    const original = tuple([bool(basic('X1')), basic('X2')]);
    const text = labelType(original);
    expect(text).toBe('ℬ(X1)×X2');
    expect(parseTypeText(text).type).toEqual(original);
  });

  it('template aliases are remapped once when bank and target names overlap', () => {
    const f1 = cst(101, 'F1', CstType.FUNCTION, '[a∈R1] {a}');
    const f2 = cst(102, 'F2', CstType.FUNCTION, '[a∈R1] F1[a]∪{a}');
    const p1 = cst(103, 'P1', CstType.PREDICATE, '[a∈R1] F2[a]={a}');
    const target = schema([cst(1, 'X1', CstType.BASE),
      cst(2, 'F1', CstType.FUNCTION, '[a∈R1] (a,a)')]);
    const plan = planTemplateInstantiation({ targetSchema: target, templateItems: [f1, f2, p1],
      prototype: p1, userArgs: [], mainItem: { ...p1, alias: 'P2' } });
    expect(plan.items.map(x => x.alias)).toEqual(['F2', 'F3', 'P2']);
    expect(plan.items[1].definition_formal).toBe('[a∈R1] F2[a]∪{a}');
  });

  it('every constituent in a cyclic SCC gets a cycle diagnostic', () => {
    const graph = new Graph([[1, 2], [2, 1], [2, 3], [3, 2]]);
    expect(graph.stronglyConnectedComponents()[0].sort()).toEqual([1, 2, 3]);
    expect([...detectDependencyCycleDiagnostics(graph, String).keys()].sort()).toEqual([1, 2, 3]);
  });

  it('comment statistics count a supplied derived-constituent comment', () => {
    const s = schema([cst(1, 'D1', CstType.TERM, '1')]);
    s.items[0].convention = 'A comment';
    expect(calculateSchemaStats(s).count_comment).toBe(1);
  });
});
