import { Edge, Node } from 'reactflow';
import dagre from '@dagrejs/dagre';

import { TMGraphNode } from '../../../models/TMGraph';

const NODE_WIDTH = 44;
const NODE_HEIGHT = 44;
const HOR_SEPARATION = 40;
const VERT_SEPARATION = 40;

const BOOLEAN_WEIGHT = 2;
const CARTESIAN_WEIGHT = 1;

export function applyLayout(nodes: Node<TMGraphNode>[], edges: Edge[]) {
  const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: 'BT',
    ranksep: VERT_SEPARATION,
    nodesep: HOR_SEPARATION,
    ranker: 'network-simplex',
    align: undefined
  });
  nodes.forEach(node => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach(edge => {
    dagreGraph.setEdge(edge.source, edge.target, { weight: edge.data ? CARTESIAN_WEIGHT : BOOLEAN_WEIGHT });
  });

  dagre.layout(dagreGraph);

  nodes.forEach(node => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.position.x = nodeWithPosition.x - NODE_WIDTH / 2;
    node.position.y = nodeWithPosition.y - NODE_HEIGHT / 2;
  });
}
