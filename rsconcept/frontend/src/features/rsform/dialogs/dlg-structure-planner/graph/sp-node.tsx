'use client';

import { Handle, type NodeProps, Position } from '@xyflow/react';
import clsx from 'clsx';

import { colorSPNode } from '@/features/rsform/colors';
import { labelType } from '@/features/rslang/labels';

import { type SPFlowNode } from './sp-models';

export function SPNodeComponent(node: NodeProps<SPFlowNode>) {
  const descriptionText = node.data.node.existing?.term_resolved || labelType(node.data.node.type);
  return (
    <>
      <Handle type='target' position={Position.Top} className='opacity-0' />

      <div className={clsx(
        'cc-node-label',
        'w-full h-full flex items-center justify-center',
        'cursor-default rounded-full'
      )}
        style={{ backgroundColor: colorSPNode(node.data) }}
      >
        {node.data.node.existing?.alias ?? 'N/A'}
      </div>

      {descriptionText ? (
        <div
          className={clsx(
            'mt-[4px] w-[120px] px-[4px] text-center translate-x-[calc(-50%+20px)]',
            'pointer-events-none',
            'cc-fade-in duration-transform delay-move',
            'text-[10px]/[12px]'
          )}
        >
          <div className='absolute top-0 px-[4px] left-0 text-center w-full line-clamp-3 hover:line-clamp-none'>
            {descriptionText}
          </div>
          <div aria-hidden className='line-clamp-3 hover:line-clamp-none cc-text-outline'>
            {descriptionText}
          </div>
        </div>
      ) : null}

      <Handle type='source' position={Position.Bottom} className='opacity-0' />
    </>
  );
}
