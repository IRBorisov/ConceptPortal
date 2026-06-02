import { useReactFlow } from '@xyflow/react';

import { NodeType } from '@rsconcept/domain/library';

import { useDraggingStore } from '@/stores/dragging';

import { useOssEdit } from '../oss-edit-context';

type NodeDragEvent = MouseEvent | TouchEvent;

function getClientPosition(event: NodeDragEvent) {
  if (!('touches' in event)) {
    return { x: event.clientX, y: event.clientY };
  }
  if ('touches' in event && event.touches.length > 0) {
    return { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }
  if ('changedTouches' in event && event.changedTouches.length > 0) {
    return { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
  }
  return { x: 0, y: 0 };
}

/** Hook to encapsulate drop target logic. */
export function useDropTarget() {
  const { getIntersectingNodes, screenToFlowPosition } = useReactFlow();
  const { selectedItems, selectedNodes: selected, schema } = useOssEdit();
  const dropTarget = useDraggingStore(state => state.dropTarget);
  const setDropTarget = useDraggingStore(state => state.setDropTarget);

  function evaluate(event: NodeDragEvent): number | null {
    const mousePosition = screenToFlowPosition(getClientPosition(event));
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

  function update(event: NodeDragEvent) {
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
