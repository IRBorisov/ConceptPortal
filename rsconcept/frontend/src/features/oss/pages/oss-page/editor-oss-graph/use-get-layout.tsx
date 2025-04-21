import { type Node, useReactFlow } from 'reactflow';

import { type IOssLayout } from '@/features/oss/backend/types';
import { type IOperationSchema } from '@/features/oss/models/oss';
import { type Position2D } from '@/features/oss/models/oss-layout';

import { useOssEdit } from '../oss-edit-context';

import { BLOCK_NODE_MIN_HEIGHT, BLOCK_NODE_MIN_WIDTH } from './graph/block-node';

export function useGetLayout() {
  const { getNodes } = useReactFlow();
  const { schema } = useOssEdit();

  return function getLayout(): IOssLayout {
    const nodes = getNodes();
    const nodeById = new Map(nodes.map(node => [node.id, node]));
    return {
      operations: nodes
        .filter(node => node.type !== 'block')
        .map(node => ({
          id: Number(node.id),
          ...computeAbsolutePosition(node, schema, nodeById)
        })),
      blocks: nodes
        .filter(node => node.type === 'block')
        .map(node => ({
          id: -Number(node.id),
          ...computeAbsolutePosition(node, schema, nodeById),
          width: node.width ?? BLOCK_NODE_MIN_WIDTH,
          height: node.height ?? BLOCK_NODE_MIN_HEIGHT
        }))
    };
  };
}

// ------- Internals -------
function computeAbsolutePosition(target: Node, schema: IOperationSchema, nodeById: Map<string, Node>): Position2D {
  const nodes = schema.hierarchy.expandAllInputs([Number(target.id)]);
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
