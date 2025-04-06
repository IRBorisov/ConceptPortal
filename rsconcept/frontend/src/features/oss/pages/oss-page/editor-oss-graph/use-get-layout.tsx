import { useReactFlow } from 'reactflow';

import { type IOssLayout } from '@/features/oss/backend/types';

export function useGetLayout() {
  const { getNodes } = useReactFlow();
  return function getLayout(): IOssLayout {
    return {
      operations: getNodes().map(node => ({
        id: Number(node.id),
        x: node.position.x,
        y: node.position.y
      })),
      blocks: []
    };
  };
}
