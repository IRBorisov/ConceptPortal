import dagre from '@dagrejs/dagre';

import { type SPFlowEdge, type SPFlowNode } from './sp-models';

const NODE_WIDTH = 44;
const NODE_HEIGHT = 44;
const HOR_SEPARATION = 80;
const VERT_SEPARATION = 60;

export function applyLayout(nodes: SPFlowNode[], edges: SPFlowEdge[]) {
  const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: 'TB',
    ranksep: VERT_SEPARATION,
    nodesep: HOR_SEPARATION,
    ranker: 'network-simplex'
  });

  nodes.forEach(node => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach(edge => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach(node => {
    const nodeWithPosition = dagreGraph.node(node.id) as { x: number; y: number };
    node.position.x = -nodeWithPosition.x + NODE_WIDTH / 2;
    node.position.y = nodeWithPosition.y - NODE_HEIGHT / 2;
  });
}
