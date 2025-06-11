import { type Node, useReactFlow } from 'reactflow';

import { type IOssLayout } from '../../../backend/types';
import { type IOperationSchema } from '../../../models/oss';
import { type Position2D } from '../../../models/oss-layout';
import { OPERATION_NODE_HEIGHT, OPERATION_NODE_WIDTH } from '../../../models/oss-layout-api';
import { useOssEdit } from '../oss-edit-context';

import { BLOCK_NODE_MIN_HEIGHT, BLOCK_NODE_MIN_WIDTH } from './graph/block-node';

export function useGetLayout() {
  const { getNodes } = useReactFlow();
  const { schema } = useOssEdit();

  return function getLayout(): IOssLayout {
    const nodes = getNodes();
    const nodeById = new Map(nodes.map(node => [node.id, node]));
    return [
      ...nodes
        .filter(node => node.type !== 'block')
        .map(node => ({
          nodeID: node.id,
          ...computeAbsolutePosition(node, schema, nodeById),
          width: OPERATION_NODE_WIDTH,
          height: OPERATION_NODE_HEIGHT
        })),
      ...nodes
        .filter(node => node.type === 'block')
        .map(node => ({
          nodeID: node.id,
          ...computeAbsolutePosition(node, schema, nodeById),
          width: node.width ?? BLOCK_NODE_MIN_WIDTH,
          height: node.height ?? BLOCK_NODE_MIN_HEIGHT
        }))
    ];
  };
}

// ------- Internals -------
function computeAbsolutePosition(target: Node, schema: IOperationSchema, nodeById: Map<string, Node>): Position2D {
  const nodes = schema.hierarchy.expandAllInputs([target.id]);
  let x = target.position.x;
  let y = target.position.y;
  for (const nodeID of nodes) {
    const node = nodeById.get(String(nodeID));
    if (node) {
      x += node.position.x;
      y += node.position.y;
    }
  }
  return { x, y };
}
