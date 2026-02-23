'use client';

import { Handle, type NodeProps, Position } from '@xyflow/react';
import clsx from 'clsx';

import { type ExpressionType } from '@/features/rslang';
import { labelRSLangNode, labelType } from '@/features/rslang/labels';

import { globalIDs } from '@/utils/constants';

import { colorBgSyntaxTree } from '../../../colors';

import { type ASTNode } from './ast-models';

const LABEL_THRESHOLD = 3;

export function ASTNodeComponent(node: NodeProps<ASTNode>) {
  const label = labelRSLangNode(node.data);
  const tooltipText = node.data.annotation?.rsType ?
    `<span class="font-math">Тип: ${labelType(node.data.annotation.rsType as ExpressionType)}</span>` : '';

  return (
    <>
      <Handle type='target' position={Position.Top} className='opacity-0' />
      <div
        className='w-full h-full cursor-default flex items-center justify-center rounded-full'
        style={{ backgroundColor: colorBgSyntaxTree(node.data) }}
        data-tooltip-id={tooltipText ? globalIDs.tooltip : undefined}
        data-tooltip-html={tooltipText ?? undefined}
      />
      <Handle type='source' position={Position.Bottom} className='opacity-0' />
      <div
        className={clsx(
          'mt-[4px] w-fit translate-x-[calc(-50%+20px)]',
          'font-math text-center ',
          label.length > LABEL_THRESHOLD ? 'text-[12px]/[16px]' : 'text-[14px]/[20px]'
        )}
        data-tooltip-id={tooltipText ? globalIDs.tooltip : undefined}
        data-tooltip-html={tooltipText ?? undefined}
      >
        <div className='absolute top-0 left-0 text-center w-full'>{label}</div>
        <div aria-hidden className='cc-ast-label-outline'>
          {label}
        </div>
      </div>
    </>
  );
}
