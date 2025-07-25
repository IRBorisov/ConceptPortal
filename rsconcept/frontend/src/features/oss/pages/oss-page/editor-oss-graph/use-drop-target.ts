import { useReactFlow } from 'reactflow';

import { NodeType } from '@/features/oss/models/oss';

import { useDraggingStore } from '@/stores/dragging';

import { useOssEdit } from '../oss-edit-context';

/** Hook to encapsulate drop target logic. */
export function useDropTarget() {
  const { getIntersectingNodes, screenToFlowPosition } = useReactFlow();
  const { selectedItems, selected, schema } = useOssEdit();
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
      .filter(node => !selected.includes(node.id))
      .map(node => schema.itemByNodeID.get(node.id))
      .filter(item => item?.nodeType === NodeType.BLOCK);

    if (blocks.length === 0) {
      return null;
    }

    const successors = schema.hierarchy.expandAllOutputs(selectedItems.map(item => item.nodeID));
    blocks = blocks.filter(block => !successors.includes(block.nodeID));
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
