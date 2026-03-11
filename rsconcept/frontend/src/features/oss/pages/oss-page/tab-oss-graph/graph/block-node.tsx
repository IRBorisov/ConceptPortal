'use client';

import { type NodeProps, NodeResizeControl } from '@xyflow/react';
import clsx from 'clsx';

import { IconResize } from '@/components/icons';
import { useDraggingStore } from '@/stores/dragging';
import { globalIDs } from '@/utils/constants';

import { useOperationTooltipStore } from '../../../../stores/operation-tooltip';
import { useOSSGraphStore } from '../../../../stores/oss-graph';
import { useOssEdit } from '../../oss-edit-context';

import { type OGBlockNode } from './og-models';

export const BLOCK_NODE_MIN_WIDTH = 160;
export const BLOCK_NODE_MIN_HEIGHT = 100;

export function BlockNodeComponent(node: NodeProps<OGBlockNode>) {
  const { selectedItems, schema } = useOssEdit();
  const dropTarget = useDraggingStore(state => state.dropTarget);
  const isDragging = useDraggingStore(state => state.isDragging);
  const showCoordinates = useOSSGraphStore(state => state.showCoordinates);
  const setHover = useOperationTooltipStore(state => state.setHoverItem);

  const focus = selectedItems.length === 1 ? selectedItems[0] : null;
  const isParent = (!!focus && schema.hierarchy.at(focus.nodeID)?.inputs.includes(node.data.block.nodeID)) ?? false;
  const isChild = (!!focus && schema.hierarchy.at(focus.nodeID)?.outputs.includes(node.data.block.nodeID)) ?? false;
  return (
    <>
      <NodeResizeControl minWidth={BLOCK_NODE_MIN_WIDTH} minHeight={BLOCK_NODE_MIN_HEIGHT}>
        <IconResize size={12} className='absolute bottom-[3px] right-[3px] cc-graph-interactive' />
      </NodeResizeControl>
      {showCoordinates ? (
        <div
          className={clsx(
            'absolute top-full mt-[4px] right-px',
            'text-[7px]/[8px] font-math',
            'text-muted-foreground hover:text-foreground'
          )}
        >
          {`X: ${node.positionAbsoluteX.toFixed(0)} Y: ${node.positionAbsoluteY.toFixed(0)}`}
        </div>
      ) : null}
      <div
        className={clsx(
          'cc-node-block h-full w-full cursor-pointer',
          isDragging && isParent && dropTarget !== node.data.block.id && 'border-destructive',
          ((isParent && !isDragging) || dropTarget === node.data.block.id) && 'border-primary',
          isChild && 'border-accent-orange'
        )}
      >
        <div className='absolute -top-[8px] left-0 w-full h-[16px] cc-graph-interactive' />
        <div className='absolute top-0 -right-[8px] h-full w-[16px] cc-graph-interactive' />
        <div className='absolute -bottom-[8px] right-0 w-full h-[16px] cc-graph-interactive' />
        <div className='absolute bottom-0 -left-[8px] h-full w-[16px] cc-graph-interactive' />

        <div
          className={clsx(
            'w-fit mx-auto -translate-y-1/2 -mt-[8px]',
            'px-[8px]',
            'bg-background rounded-lg',
            'text-[18px]/[20px] line-clamp-2 text-center text-ellipsis',
            'cc-graph-interactive'
          )}
          data-tooltip-id={globalIDs.operation_tooltip}
          onMouseEnter={() => setHover(node.data.block)}
        >
          {node.data.label}
        </div>
      </div>
    </>
  );
}
