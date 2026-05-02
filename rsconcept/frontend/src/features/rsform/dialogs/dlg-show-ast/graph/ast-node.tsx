'use client';

import { Handle, type NodeProps, Position } from '@xyflow/react';
import clsx from 'clsx';

import { type RSForm } from '@/domain/library/rsform';
import { readErrorAnnotation, readTypeAnnotation } from '@/domain/rslang';
import { describeRSError, labelRSLangNode, labelType } from '@/domain/rslang/labels';
import { TokenID } from '@/domain/rslang/parser/token';
import { useTx } from '@/i18n';

import { useValueTooltipStore } from '@/stores/value-tooltip';
import { globalIDs } from '@/utils/constants';
import { type AstNode, type FlatAstNode } from '@/utils/parsing';

import { colorBgSyntaxTree } from '../../../colors';
import { useShowAstSchema } from '../show-ast-schema-context';

import { type AstGraphNode } from './ast-models';

const LABEL_THRESHOLD = 3;

export function ASTNodeComponent(node: NodeProps<AstGraphNode>) {
  const tx = useTx();
  const schema = useShowAstSchema();
  const setActiveTooltipText = useValueTooltipStore(state => state.setActiveText);
  const label = labelRSLangNode(node.data);
  const errorData = readErrorAnnotation(node.data as AstNode);
  const errorMessage = errorData ? describeRSError(errorData.code, errorData.params ?? []) : '';
  const tooltipText = buildTooltip(node.data, schema, errorMessage, tx);

  return (
    <>
      <Handle type='target' position={Position.Top} className='opacity-0' />
      <div
        className={clsx(
          'w-full h-full cursor-default flex items-center justify-center rounded-full',
          errorMessage && 'ring-2 ring-destructive ring-offset-2 ring-offset-background'
        )}
        style={{ backgroundColor: colorBgSyntaxTree(node.data) }}
        data-tooltip-id={tooltipText ? globalIDs.value_tooltip : undefined}
        onPointerEnter={tooltipText ? () => setActiveTooltipText(tooltipText) : undefined}
      />
      <Handle type='source' position={Position.Bottom} className='opacity-0' />
      <div
        className={clsx(
          'mt-[4px] w-fit translate-x-[calc(-50%+20px)]',
          'font-math text-center ',
          label.length > LABEL_THRESHOLD ? 'text-[12px]/[16px]' : 'text-[14px]/[20px]'
        )}
        data-tooltip-id={tooltipText ? globalIDs.value_tooltip : undefined}
        onPointerEnter={tooltipText ? () => setActiveTooltipText(tooltipText) : undefined}
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
function buildTooltip(
  data: FlatAstNode,
  schema: RSForm | null,
  errorMessages: string,
  tx: (id: string, values?: Record<string, string | number | boolean | Date | null | undefined>) => string
): string {
  const type = readTypeAnnotation(data as AstNode);
  const typeLine = type ? `${tx('ui.node.ast.typePrefix')} ${labelType(type)}` : '';
  const errorBlock = errorMessages ? `${errorMessages}` : '';
  const isGlobalId =
    data.typeID === TokenID.ID_GLOBAL || data.typeID === TokenID.ID_FUNCTION || data.typeID === TokenID.ID_PREDICATE;
  let extra = '';
  const alias = typeof data.data.value === 'string' ? data.data.value : '';
  if (isGlobalId && schema) {
    if (alias) {
      const cst = schema.cstByAlias.get(alias);
      const termText = cst ? (cst.term_resolved || cst.term_raw).trim() : '';
      if (termText) {
        extra = `${tx('ui.node.ast.termPrefix')} ${termText}`;
      }
    }
  } else if (data.typeID === TokenID.ID_RADICAL && schema) {
    extra = `${tx('ui.node.ast.templateParam')} ${alias}`;
  }

  const parts = [typeLine, errorBlock, extra].filter(Boolean);
  return parts.join(parts.length > 0 ? '\n' : '');
}
