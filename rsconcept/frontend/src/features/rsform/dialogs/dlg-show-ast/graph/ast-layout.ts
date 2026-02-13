import dagre from '@dagrejs/dagre';
import { type Edge, type Node } from '@xyflow/react';

import { PARAMETER } from '@/utils/constants';

/** Node data after dagre layout (x, y set by layout). */
interface DagreLayoutNode {
  x: number;
  y: number;
}
import { type FlatAstNode } from '@/utils/parsing';

export function applyLayout(nodes: Node<FlatAstNode>[], edges: Edge[]) {
  const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: 'TB',
    ranksep: 40,
    nodesep: 40,
    ranker: 'network-simplex'
  });

  for (const node of nodes) {
    dagreGraph.setNode(node.id, { width: 2 * PARAMETER.graphNodeRadius, height: 2 * PARAMETER.graphNodeRadius });
  }

  for (const edge of edges) {
    dagreGraph.setEdge(edge.source, edge.target);
  }

  dagre.layout(dagreGraph);

  for (const node of nodes) {
    const nodeWithPosition = dagreGraph.node(node.id) as DagreLayoutNode;
    node.position.x = nodeWithPosition.x - PARAMETER.graphNodeRadius;
    node.position.y = nodeWithPosition.y - PARAMETER.graphNodeRadius;
  }
}
