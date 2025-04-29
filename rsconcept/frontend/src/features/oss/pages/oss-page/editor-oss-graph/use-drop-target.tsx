import { useReactFlow } from 'reactflow';

import { useDraggingStore } from '@/stores/dragging';

import { useOssEdit } from '../oss-edit-context';

/** Hook to encapsulate drop target logic. */
export function useDropTarget() {
  const { getIntersectingNodes, screenToFlowPosition } = useReactFlow();
  const { selected, schema } = useOssEdit();
  const dropTarget = useDraggingStore(state => state.dropTarget);
  const setDropTarget = useDraggingStore(state => state.setDropTarget);

  function evaluate(event: React.MouseEvent): number | null {
    const mousePosition = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    let blocks = getIntersectingNodes({
      x: mousePosition.x,
      y: mousePosition.y,
      width: 1,
      height: 1
    })
      .map(node => Number(node.id))
      .filter(id => id < 0 && !selected.includes(id))
      .map(id => schema.blockByID.get(-id))
      .filter(block => !!block);

    if (blocks.length === 0) {
      return null;
    }

    const successors = schema.hierarchy.expandAllOutputs([...selected]).filter(id => id < 0);
    blocks = blocks.filter(block => !successors.includes(-block.id));
    if (blocks.length === 0) {
      return null;
    }
    if (blocks.length === 1) {
      return blocks[0].id;
    }

    const parents = blocks.map(block => block.parent).filter(id => !!id);
    const potentialTargets = blocks.map(block => block.id).filter(id => !parents.includes(id));
    if (potentialTargets.length === 0) {
      return null;
    } else {
      return potentialTargets[0];
    }
  }

  function update(event: React.MouseEvent) {
    setDropTarget(evaluate(event));
  }

  function reset() {
    setDropTarget(null);
  }

  function get() {
    return dropTarget;
  }

  return { get, update, reset, evaluate };
}
