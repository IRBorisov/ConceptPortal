'use client';

import { Handle, type NodeProps, Position } from '@xyflow/react';
import clsx from 'clsx';

import { colorBgSyntaxTree } from '../../../colors';
import { labelRSLangNode } from '../../../labels';

import { type ASTNode } from './ast-models';

const LABEL_THRESHOLD = 3;

export function ASTNodeComponent(node: NodeProps<ASTNode>) {
  const label = labelRSLangNode(node.data);

  return (
    <>
      <Handle type='target' position={Position.Top} className='opacity-0' />
      <div
        className='w-full h-full cursor-default flex items-center justify-center rounded-full'
        style={{ backgroundColor: colorBgSyntaxTree(node.data) }}
      />
      <Handle type='source' position={Position.Bottom} className='opacity-0' />
      <div
        className={clsx(
          'mt-[4px] w-fit translate-x-[calc(-50%+20px)]',
          'font-math text-center ',
          'pointer-events-none',
          label.length > LABEL_THRESHOLD ? 'text-[12px]/[16px]' : 'text-[14px]/[20px]'
        )}
      >
        <div className='absolute top-0 left-0 text-center w-full'>{label}</div>
        <div aria-hidden className='cc-ast-label-outline'>
          {label}
        </div>
      </div>
    </>
  );
}
