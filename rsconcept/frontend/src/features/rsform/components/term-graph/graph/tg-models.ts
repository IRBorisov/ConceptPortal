/**
 * Module: Graph of Terms graphical representation.
 */
import dagre from '@dagrejs/dagre';
import { type Edge, type Node } from '@xyflow/react';

import { type Graph } from '@/models/graph';
import { PARAMETER } from '@/utils/constants';

import { CstType } from '../../../backend/types';
import { type IConstituenta, type IRSForm } from '../../../models/rsform';
import { type GraphFilterParams, TGEdgeType } from '../../../stores/term-graph';

export interface TGNodeState extends Record<string, unknown> {
  cst: IConstituenta;
  focused: boolean;
}

/** Represents graph node. */
export type TGNode = Node<TGNodeState>;

export function applyLayout(nodes: Node<TGNodeState>[], edges: Edge[], subLabels: boolean) {
  const rankSeparation = subLabels ? 3 * PARAMETER.graphNodeRadius : 2 * PARAMETER.graphNodeRadius;
  const nodeSeparation = subLabels ? 5 * PARAMETER.graphNodeRadius : 1 * PARAMETER.graphNodeRadius;
  const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: 'TB',
    ranksep: rankSeparation,
    nodesep: nodeSeparation,
    ranker: 'longest-path'
  });

  const isolated = nodes.filter(node => edges.every(edge => edge.source !== node.id && edge.target !== node.id));
  const nonIsolated = nodes.filter(node => isolated.find(i => i.id === node.id) === undefined);

  nonIsolated.forEach(node => {
    dagreGraph.setNode(node.id, { width: 2 * PARAMETER.graphNodeRadius, height: 2 * PARAMETER.graphNodeRadius });
  });

  edges.forEach(edge => {
    if (
      isolated.find(i => i.id === edge.source) === undefined &&
      isolated.find(i => i.id === edge.target) === undefined
    ) {
      dagreGraph.setEdge(edge.source, edge.target);
    }
  });

  dagre.layout(dagreGraph);

  if (isolated.length > 0) {
    const xs = nonIsolated.map(n => dagreGraph.node(n.id).x);
    const maxY = nonIsolated.length ? Math.min(...nonIsolated.map(node => dagreGraph.node(node.id).y)) : 0;
    const minX = nonIsolated.length ? Math.min(...xs) : 0;
    const maxX = nonIsolated.length ? Math.max(...xs) : 0;
    const midX = (minX + maxX) / 2;

    const cellWidth = nodeSeparation + 2 * PARAMETER.graphNodeRadius;
    const cellHeight = rankSeparation + 2 * PARAMETER.graphNodeRadius;

    const cols = Math.ceil(2 * Math.sqrt(isolated.length / 2));
    const width = (cols - 1) * cellWidth;
    const startY = maxY - cellHeight - rankSeparation;
    const startX = midX - width / 2;

    isolated.forEach((node, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;

      node.position.x = startX + col * cellWidth;
      node.position.y = startY - row * cellHeight;
    });
  }

  nonIsolated.forEach(node => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.position.x = nodeWithPosition.x - PARAMETER.graphNodeRadius;
    node.position.y = nodeWithPosition.y - PARAMETER.graphNodeRadius;
  });
}

export function inferEdgeType(schema: IRSForm, source: number, target: number): TGEdgeType {
  const isDefinition = schema.graph.hasEdge(source, target);
  const isAttribution = schema.attribution_graph.hasEdge(source, target);
  if (!isDefinition && !isAttribution) {
    return TGEdgeType.definition;
  } else if (isDefinition && isAttribution) {
    return TGEdgeType.full;
  } else if (isDefinition) {
    return TGEdgeType.definition;
  } else {
    return TGEdgeType.attribution;
  }
}

export function produceFilteredGraph(
  schema: IRSForm,
  params: GraphFilterParams,
  focusCst: IConstituenta | null
): Graph<number> {
  const allowedTypes: CstType[] = (() => {
    const result: CstType[] = [];
    if (params.allowBase) result.push(CstType.BASE);
    if (params.allowStruct) result.push(CstType.STRUCTURED);
    if (params.allowTerm) result.push(CstType.TERM);
    if (params.allowAxiom) result.push(CstType.AXIOM);
    if (params.allowFunction) result.push(CstType.FUNCTION);
    if (params.allowPredicate) result.push(CstType.PREDICATE);
    if (params.allowConstant) result.push(CstType.CONSTANT);
    if (params.allowTheorem) result.push(CstType.THEOREM);
    if (params.allowNominal) result.push(CstType.NOMINAL);
    return result;
  })();

  if (params.graphType === TGEdgeType.attribution) {
    return applyToGraph(schema.attribution_graph.clone(), schema, params, allowedTypes, focusCst);
  }
  if (params.graphType === TGEdgeType.definition) {
    return applyToGraph(schema.graph.clone(), schema, params, allowedTypes, focusCst);
  }

  const definitionGraph = applyToGraph(schema.graph.clone(), schema, params, allowedTypes, focusCst);
  const attributionGraph = applyToGraph(schema.attribution_graph.clone(), schema, params, allowedTypes, focusCst);

  for (const node of attributionGraph.nodes) {
    definitionGraph.addNode(node[0]);
    for (const target of node[1].outputs) {
      if (!definitionGraph.hasEdge(target, node[0])) {
        definitionGraph.addEdge(node[0], target);
      }
    }
  }
  return definitionGraph;
}

// ===== Internals =====
function applyToGraph(
  target: Graph<number>,
  schema: IRSForm,
  params: GraphFilterParams,
  allowedTypes: CstType[],
  focusCst: IConstituenta | null
): Graph<number> {
  if (params.noTemplates) {
    schema.items.forEach(cst => {
      if (cst !== focusCst && cst.is_template) {
        target.foldNode(cst.id);
      }
    });
  }
  if (allowedTypes.length < Object.values(CstType).length) {
    schema.items.forEach(cst => {
      if (cst !== focusCst && !allowedTypes.includes(cst.cst_type)) {
        target.foldNode(cst.id);
      }
    });
  }
  if (!focusCst && params.foldDerived) {
    schema.items.forEach(cst => {
      if (cst.spawner) {
        target.foldNode(cst.id);
      }
    });
  }
  if (params.noHermits) {
    target.removeIsolated();
  }

  if (focusCst) {
    const includes: number[] = [
      focusCst.id,
      ...focusCst.spawn,
      ...(params.focusShowInputs ? schema.graph.expandInputs([focusCst.id]) : []),
      ...(params.focusShowOutputs ? schema.graph.expandOutputs([focusCst.id]) : [])
    ];
    schema.items.forEach(cst => {
      if (!includes.includes(cst.id)) {
        target.foldNode(cst.id);
      }
    });
  }

  if (params.noTransitive) {
    target.transitiveReduction();
  }

  return target;
}
