/**
 * Module: Graph of Terms graphical representation.
 */
import { type Edge, type Node } from 'reactflow';
import dagre from '@dagrejs/dagre';

import { PARAMETER } from '@/utils/constants';

import { CstType } from '../backend/types';
import { type GraphFilterParams, type GraphType } from '../stores/term-graph';

import { type IConstituenta, type IRSForm } from './rsform';

export interface TGNodeState {
  cst: IConstituenta;
  focused: boolean;
}

/** Represents graph node. */
export interface TGNodeData extends Node {
  id: string;
  data: TGNodeState;
}

/** Represents graph node internal data. */
export interface TGNodeInternal {
  id: string;
  data: TGNodeState;
  selected: boolean;
  dragging: boolean;
  xPos: number;
  yPos: number;
}

export function applyLayout(nodes: Node<TGNodeState>[], edges: Edge[], subLabels: boolean) {
  const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: 'TB',
    ranksep: subLabels ? 60 : 40,
    nodesep: subLabels ? 100 : 20,
    ranker: 'network-simplex'
  });
  nodes.forEach(node => {
    dagreGraph.setNode(node.id, { width: 2 * PARAMETER.graphNodeRadius, height: 2 * PARAMETER.graphNodeRadius });
  });

  edges.forEach(edge => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach(node => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.position.x = nodeWithPosition.x - PARAMETER.graphNodeRadius;
    node.position.y = nodeWithPosition.y - PARAMETER.graphNodeRadius;
  });
}

export function inferEdgeType(schema: IRSForm, source: number, target: number): GraphType | null {
  const isDefinition = schema.graph.hasEdge(source, target);
  const isAssociation = schema.association_graph.hasEdge(source, target);
  if (!isDefinition && !isAssociation) {
    return null;
  } else if (isDefinition && isAssociation) {
    return 'full';
  } else if (isDefinition) {
    return 'definition';
  } else {
    return 'association';
  }
}

export function produceFilteredGraph(schema: IRSForm, params: GraphFilterParams, focusCst: IConstituenta | null) {
  const filtered =
    params.graphType === 'full'
      ? schema.full_graph.clone()
      : params.graphType === 'association'
      ? schema.association_graph.clone()
      : schema.graph.clone();
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

  if (params.noTemplates) {
    schema.items.forEach(cst => {
      if (cst !== focusCst && cst.is_template) {
        filtered.foldNode(cst.id);
      }
    });
  }
  if (allowedTypes.length < Object.values(CstType).length) {
    schema.items.forEach(cst => {
      if (cst !== focusCst && !allowedTypes.includes(cst.cst_type)) {
        filtered.foldNode(cst.id);
      }
    });
  }
  if (!focusCst && params.foldDerived) {
    schema.items.forEach(cst => {
      if (cst.spawner) {
        filtered.foldNode(cst.id);
      }
    });
  }
  if (params.noHermits) {
    filtered.removeIsolated();
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
        filtered.foldNode(cst.id);
      }
    });
  }
  if (params.noTransitive) {
    filtered.transitiveReduction();
  }

  return filtered;
}
