'use client';

import { Handle, type NodeProps, Position } from '@xyflow/react';
import clsx from 'clsx';

import { type RSForm } from '@/features/rsform/models/rsform';
import { type ExpressionType } from '@/features/rslang';
import { labelRSLangNode, labelType } from '@/features/rslang/labels';
import { TokenID } from '@/features/rslang/parser/token';

import { globalIDs } from '@/utils/constants';
import { type FlatAstNode } from '@/utils/parsing';

import { colorBgSyntaxTree } from '../../../colors';
import { useShowAstSchema } from '../show-ast-schema-context';

import { type ASTNode } from './ast-models';

const LABEL_THRESHOLD = 3;

export function ASTNodeComponent(node: NodeProps<ASTNode>) {
  const schema = useShowAstSchema();
  const label = labelRSLangNode(node.data);
  const tooltipText = buildTooltip(node.data, schema);

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

// ====== Internal ======
function buildTooltip(data: FlatAstNode, schema: RSForm | null): string {
  const rsType = data.annotation?.rsType as ExpressionType | undefined;
  const typeLine = rsType ? `Тип: <span class="font-math">${labelType(rsType)}</span>` : '';
  const isGlobalId =
    data.typeID === TokenID.ID_GLOBAL ||
    data.typeID === TokenID.ID_FUNCTION ||
    data.typeID === TokenID.ID_PREDICATE;
  if (!isGlobalId || !schema) {
    return typeLine;
  }

  const alias = typeof data.data.value === 'string' ? data.data.value : '';
  if (!alias) {
    return typeLine;
  }
  const cst = schema.cstByAlias.get(alias);
  const termText = cst ? (cst.term_resolved || cst.term_raw).trim() : '';
  if (!termText) {
    return typeLine;
  }
  const term = `<span>Термин: ${termText}</span>`;
  return `${typeLine}<br/>${term}`;
}