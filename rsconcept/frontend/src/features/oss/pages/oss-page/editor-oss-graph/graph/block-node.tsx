'use client';

import { NodeResizeControl } from 'reactflow';
import clsx from 'clsx';

import { useOSSGraphStore } from '@/features/oss/stores/oss-graph';

import { IconResize } from '@/components/icons';

import { type BlockInternalNode } from '../../../../models/oss-layout';
import { useOssEdit } from '../../oss-edit-context';

export const BLOCK_NODE_MIN_WIDTH = 160;
export const BLOCK_NODE_MIN_HEIGHT = 100;

export function BlockNode(node: BlockInternalNode) {
  const showCoordinates = useOSSGraphStore(state => state.showCoordinates);
  const { selected, schema } = useOssEdit();
  const focus = selected.length === 1 ? selected[0] : null;
  const isParent = (!!focus && schema.hierarchy.at(focus)?.inputs.includes(-node.data.block.id)) ?? false;
  const isChild = (!!focus && schema.hierarchy.at(focus)?.outputs.includes(-node.data.block.id)) ?? false;
  return (
    <>
      <NodeResizeControl minWidth={BLOCK_NODE_MIN_WIDTH} minHeight={BLOCK_NODE_MIN_HEIGHT}>
        <IconResize size={8} className='absolute bottom-[2px] right-[2px]' />
      </NodeResizeControl>
      {showCoordinates ? (
        <div
          className={clsx(
            'absolute top-full mt-1 right-[1px]',
            'text-[7px]/[8px] font-math',
            'text-muted-foreground hover:text-foreground'
          )}
        >
          {`X: ${node.xPos.toFixed(0)} Y: ${node.yPos.toFixed(0)}`}
        </div>
      ) : null}
      <div
        className={clsx(
          'cc-node-block h-full w-full',
          isParent && 'border-primary',
          isChild && 'border-accent-orange50'
        )}
      >
        <div
          className={clsx(
            'w-fit mx-auto -translate-y-1/2 -mt-[8px]',
            'px-2',
            'bg-background rounded-lg',
            'text-[18px]/[20px] line-clamp-2 text-center text-ellipsis',
            'pointer-events-auto'
          )}
        >
          {node.data.label}
        </div>
      </div>
    </>
  );
}
