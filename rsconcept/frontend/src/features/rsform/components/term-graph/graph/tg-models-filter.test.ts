import { describe, expect, it } from 'vitest';

import { Graph } from '@rsconcept/domain/graph/graph';
import { type Constituenta, CstClass, CstType, type RSForm } from '@rsconcept/domain/library';

import { type GraphFilterParams, TGEdgeType } from '../../../stores/term-graph';

import { isSemanticCoreCst, produceFilteredGraph } from './tg-models';

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

function mockSchema(items: Constituenta[], edges: number[][]): RSForm {
  const graph = new Graph(edges);
  for (const cst of items) {
    graph.addNode(cst.id);
  }
  return {
    items,
    graph,
    attribution_graph: new Graph(),
    cstByID: new Map(items.map(cst => [cst.id, cst]))
  } as RSForm;
}

function baseFilter(overrides: Partial<GraphFilterParams> = {}): GraphFilterParams {
  return {
    graphType: TGEdgeType.definition,
    noHermits: false,
    noTransitive: true,
    noTemplates: false,
    noText: false,
    foldDerived: false,
    overviewCore: false,
    focusShowInputs: true,
    focusShowOutputs: true,
    allowBase: true,
    allowStruct: true,
    allowTerm: true,
    allowAxiom: true,
    allowFunction: true,
    allowPredicate: true,
    allowConstant: true,
    allowStatement: true,
    allowNominal: true,
    ...overrides
  };
}

describe('isSemanticCoreCst', () => {
  it('treats basic concepts and crucial constituents as core', () => {
    expect(isSemanticCoreCst(mockCst({ id: 1, alias: 'X1', cst_type: CstType.BASE }))).toBe(true);
    expect(isSemanticCoreCst(mockCst({ id: 2, alias: 'A1', cst_type: CstType.AXIOM }))).toBe(true);
    expect(isSemanticCoreCst(mockCst({ id: 3, alias: 'D1', cst_type: CstType.TERM }))).toBe(false);
    expect(isSemanticCoreCst(mockCst({ id: 4, alias: 'D2', cst_type: CstType.TERM, crucial: true }))).toBe(true);
  });
});

describe('produceFilteredGraph overviewCore', () => {
  const x1 = mockCst({ id: 1, alias: 'X1', cst_type: CstType.BASE });
  const d1 = mockCst({ id: 2, alias: 'D1', cst_type: CstType.TERM });
  const a1 = mockCst({ id: 3, alias: 'A1', cst_type: CstType.AXIOM });
  const d2 = mockCst({ id: 4, alias: 'D2', cst_type: CstType.TERM });
  // X1 → D1 → A1, and X1 → D2
  const schema = mockSchema(
    [x1, d1, a1, d2],
    [
      [1, 2],
      [2, 3],
      [1, 4]
    ]
  );

  it('keeps only axiomatic-core nodes and bridges edges through folded terms', () => {
    const graph = produceFilteredGraph(schema, baseFilter({ overviewCore: true }), null);

    expect([...graph.nodes.keys()].sort()).toEqual([1, 3]);
    expect(graph.hasEdge(1, 3)).toBe(true);
    expect(graph.hasNode(2)).toBe(false);
    expect(graph.hasNode(4)).toBe(false);
  });

  it('keeps crucial derived terms in the overview', () => {
    const crucialTerm = mockCst({ id: 4, alias: 'D2', cst_type: CstType.TERM, crucial: true });
    const withCrucial = mockSchema(
      [x1, d1, a1, crucialTerm],
      [
        [1, 2],
        [2, 3],
        [1, 4]
      ]
    );
    const graph = produceFilteredGraph(withCrucial, baseFilter({ overviewCore: true }), null);

    expect(graph.hasNode(4)).toBe(true);
  });
});

describe('produceFilteredGraph focus', () => {
  const x1 = mockCst({ id: 1, alias: 'X1', cst_type: CstType.BASE });
  const d1 = mockCst({ id: 2, alias: 'D1', cst_type: CstType.TERM });
  const d2 = mockCst({ id: 3, alias: 'D2', cst_type: CstType.TERM, spawn: [] });
  const d3 = mockCst({ id: 4, alias: 'D3', cst_type: CstType.TERM });
  // X1 → D1 → D2 → D3
  const schema = mockSchema(
    [x1, d1, d2, d3],
    [
      [1, 2],
      [2, 3],
      [3, 4]
    ]
  );

  it('shows focus neighborhood plus core ancestors', () => {
    const graph = produceFilteredGraph(schema, baseFilter({ overviewCore: true }), d2);

    // focus D2, input D1, output D3, core ancestor X1
    expect([...graph.nodes.keys()].sort()).toEqual([1, 2, 3, 4]);
    expect(graph.hasEdge(1, 2)).toBe(true);
  });
});
