import { type Node, useReactFlow } from 'reactflow';

import { DEFAULT_BLOCK_HEIGHT, DEFAULT_BLOCK_WIDTH } from '@/features/oss/backend/oss-loader';
import { type IOssLayout } from '@/features/oss/backend/types';
import { type IOperationSchema } from '@/features/oss/models/oss';
import { type Position2D } from '@/features/oss/models/oss-layout';

import { useOssEdit } from '../oss-edit-context';

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
          width: node.width ?? DEFAULT_BLOCK_WIDTH,
          height: node.height ?? DEFAULT_BLOCK_HEIGHT
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
