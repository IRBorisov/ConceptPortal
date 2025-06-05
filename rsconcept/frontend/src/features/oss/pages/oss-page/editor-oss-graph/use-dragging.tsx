import { type Node } from 'reactflow';

import { useThrottleCallback } from '@/hooks/use-throttle-callback';
import { useDraggingStore } from '@/stores/dragging';

import { useMoveItems } from '../../../backend/use-move-items';
import { NodeType } from '../../../models/oss';
import { useOssEdit } from '../oss-edit-context';

import { useOssFlow } from './oss-flow-context';
import { useDropTarget } from './use-drop-target';
import { useGetLayout } from './use-get-layout';

const DRAG_THROTTLE_DELAY = 50; // ms

interface DraggingProps {
  hideContextMenu: () => void;
}

/** Hook to encapsulate dragging logic. */
export function useDragging({ hideContextMenu }: DraggingProps) {
  const { setContainMovement, containMovement, setNodes } = useOssFlow();
  const setIsDragging = useDraggingStore(state => state.setIsDragging);
  const isDragging = useDraggingStore(state => state.isDragging);
  const getLayout = useGetLayout();
  const { selected, schema } = useOssEdit();
  const dropTarget = useDropTarget();
  const { moveItems } = useMoveItems();

  function applyContainMovement(target: string[], value: boolean) {
    setNodes(prev =>
      prev.map(node =>
        target.includes(node.id)
          ? {
              ...node,
              extent: value ? 'parent' : undefined,
              expandParent: value ? true : undefined
            }
          : node
      )
    );
  }

  function handleDragStart(event: React.MouseEvent, target: Node) {
    if (event.shiftKey) {
      setContainMovement(true);
      applyContainMovement([target.id, ...selected], true);
    } else {
      setContainMovement(false);
      dropTarget.update(event);
    }
    hideContextMenu();
  }

  const handleDrag = useThrottleCallback((event: React.MouseEvent) => {
    if (containMovement) {
      return;
    }
    setIsDragging(true);
    dropTarget.update(event);
  }, DRAG_THROTTLE_DELAY);

  function handleDragStop(event: React.MouseEvent, target: Node) {
    if (containMovement) {
      applyContainMovement([target.id, ...selected], false);
    } else {
      event.preventDefault();
      event.stopPropagation();

      if (isDragging) {
        setIsDragging(false);
        const new_parent = dropTarget.evaluate(event);
        const allSelected = [...selected.filter(id => id != target.id), target.id].map(id =>
          schema.itemByNodeID.get(id)
        );
        const parents = new Set(allSelected.map(item => item?.parent).filter(id => !!id));
        const operations = allSelected.filter(item => item?.nodeType === NodeType.OPERATION);
        const blocks = allSelected.filter(item => item?.nodeType === NodeType.BLOCK);
        if (
          (parents.size !== 1 || parents.values().next().value !== new_parent) &&
          (parents.size !== 0 || new_parent !== null)
        ) {
          void moveItems({
            itemID: schema.id,
            data: {
              layout: getLayout(),
              operations: operations.map(operation => operation.id),
              blocks: blocks.map(block => block.id),
              destination: new_parent
            }
          });
        }
      }
    }

    setContainMovement(false);
    dropTarget.reset();
  }

  return {
    handleDragStart,
    handleDrag,
    handleDragStop
  };
}
