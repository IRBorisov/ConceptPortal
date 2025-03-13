'use client';

import { Handle, Position } from 'reactflow';
import clsx from 'clsx';

import { colorBgSyntaxTree } from '../../../colors';
import { labelSyntaxTree } from '../../../labels';
import { type ISyntaxTreeNode } from '../../../models/rslang';

const LABEL_THRESHOLD = 3;

/**
 * Represents graph AST node internal data.
 */
interface ASTNodeInternal {
  id: string;
  data: ISyntaxTreeNode;
  dragging: boolean;
  selected: boolean;
  xPos: number;
  yPos: number;
}

export function ASTNode(node: ASTNodeInternal) {
  const label = labelSyntaxTree(node.data);

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
          'font-math mt-1 w-fit text-center translate-x-[calc(-50%+20px)]',
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
