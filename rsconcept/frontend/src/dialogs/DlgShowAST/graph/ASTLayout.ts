import dagre from '@dagrejs/dagre';
import { Edge, Node } from 'reactflow';

import { ISyntaxTreeNode } from '@/models/rslang';
import { PARAMETER } from '@/utils/constants';

export function applyLayout(nodes: Node<ISyntaxTreeNode>[], edges: Edge[]) {
  const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: 'TB',
    ranksep: 40,
    nodesep: 40,
    ranker: 'network-simplex',
    align: undefined
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
