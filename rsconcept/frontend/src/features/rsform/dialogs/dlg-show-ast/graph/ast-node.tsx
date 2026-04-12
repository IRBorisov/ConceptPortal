'use client';

import { Handle, type NodeProps, Position } from '@xyflow/react';
import clsx from 'clsx';

import { type RSForm } from '@/domain/library/rsform';
import { type ExpressionType, readErrorAnnotation } from '@/domain/rslang';
import { describeRSError, labelRSLangNode, labelType } from '@/domain/rslang/labels';
import { TokenID } from '@/domain/rslang/parser/token';
import { globalIDs } from '@/utils/constants';
import { type FlatAstNode } from '@/utils/parsing';

import { colorBgSyntaxTree } from '../../../colors';
import { useShowAstSchema } from '../show-ast-schema-context';

import { type ASTNode } from './ast-models';

const LABEL_THRESHOLD = 3;

export function ASTNodeComponent(node: NodeProps<ASTNode>) {
  const schema = useShowAstSchema();
  const label = labelRSLangNode(node.data);
  const errorData = readErrorAnnotation(node.data.annotation);
  const errorMessage = errorData ? describeRSError(errorData.code, errorData.params ?? []) : '';
  const tooltipText = buildTooltip(node.data, schema, errorMessage);

  return (
    <>
      <Handle type='target' position={Position.Top} className='opacity-0' />
      <div
        className={clsx(
          'w-full h-full cursor-default flex items-center justify-center rounded-full',
          errorMessage && 'ring-2 ring-destructive ring-offset-2 ring-offset-background'
        )}
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
function buildTooltip(data: FlatAstNode, schema: RSForm | null, errorMessages: string): string {
  const rsType = data.annotation?.rsType as ExpressionType | undefined;
  const typeLine = rsType ? `Тип: <span class="font-math">${labelType(rsType)}</span>` : '';
  const errorBlock = errorMessages ? `<span class="text-destructive">${errorMessages}</span>` : '';
  const isGlobalId =
    data.typeID === TokenID.ID_GLOBAL || data.typeID === TokenID.ID_FUNCTION || data.typeID === TokenID.ID_PREDICATE;
  let extra = '';
  if (isGlobalId && schema) {
    const alias = typeof data.data.value === 'string' ? data.data.value : '';
    if (alias) {
      const cst = schema.cstByAlias.get(alias);
      const termText = cst ? (cst.term_resolved || cst.term_raw).trim() : '';
      if (termText) {
        extra = `<span>Термин: ${termText}</span>`;
      }
    }
  }

  const parts = [typeLine, errorBlock, extra].filter(Boolean);
  return parts.join(parts.length > 0 ? '<br/>' : '');
}
