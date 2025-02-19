import { Edge, Node } from 'reactflow';
import dagre from '@dagrejs/dagre';

import { PARAMETER } from '@/utils/constants';

import { TGNodeData } from './TGNode';

export function applyLayout(nodes: Node<TGNodeData>[], edges: Edge[], subLabels?: boolean) {
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
