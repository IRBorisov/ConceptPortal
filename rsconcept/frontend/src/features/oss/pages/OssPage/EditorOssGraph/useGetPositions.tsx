import { useReactFlow } from 'reactflow';

export function useGetPositions() {
  const { getNodes } = useReactFlow();
  return function getPositions() {
    return getNodes().map(node => ({
      id: Number(node.id),
      position_x: node.position.x,
      position_y: node.position.y
    }));
  };
}
