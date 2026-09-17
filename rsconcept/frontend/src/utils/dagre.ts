/**
 * Module: Typed Dagre 3 graph helpers.
 *
 * The constructor defaults to `any` node labels, which breaks
 * `@typescript-eslint/no-unsafe-*` on layout coordinates.
 */
import { type EdgeLabel, Graph, type GraphLabel, layout, type NodeLabel } from '@dagrejs/dagre';

export type DagreGraph = Graph<GraphLabel, NodeLabel, EdgeLabel>;

export function createDagreGraph(): DagreGraph {
  return new Graph<GraphLabel, NodeLabel, EdgeLabel>().setDefaultEdgeLabel(() => ({}));
}

export function dagreLayout(graph: DagreGraph, options?: Parameters<typeof layout>[1]) {
  layout(graph, options);
}

export function dagreNodePosition(graph: DagreGraph, id: string): { x: number; y: number } {
  const label = graph.node(id);
  return { x: label?.x ?? 0, y: label?.y ?? 0 };
}
