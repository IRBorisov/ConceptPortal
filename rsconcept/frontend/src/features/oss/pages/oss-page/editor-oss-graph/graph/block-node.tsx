'use client';

import { NodeResizeControl } from 'reactflow';
import clsx from 'clsx';

import { IconResize } from '@/components/icons';

import { type BlockInternalNode } from '../../../../models/oss-layout';
import { useOssEdit } from '../../oss-edit-context';

export function BlockNode(node: BlockInternalNode) {
  const { selected, schema } = useOssEdit();
  const singleSelected = selected.length === 1 ? selected[0] : null;
  const isParent = !singleSelected ? false : schema.hierarchy.at(singleSelected)?.inputs.includes(node.data.block.id);
  return (
    <>
      <NodeResizeControl minWidth={160} minHeight={100}>
        <IconResize size={8} className='absolute bottom-[2px] right-[2px]' />
      </NodeResizeControl>
      <div className={clsx('cc-node-block h-full w-full', isParent && 'border-primary')}>
        <div
          className={clsx(
            'w-fit mx-auto -translate-y-[14px]',
            'px-2',
            'bg-background rounded-lg',
            'text-xs line-clamp-1 text-ellipsis',
            'pointer-events-auto'
          )}
        >
          {node.data.label}
        </div>
      </div>
    </>
  );
}
