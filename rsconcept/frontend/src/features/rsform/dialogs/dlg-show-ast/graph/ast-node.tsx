'use client';

import { Handle, type NodeProps, Position } from '@xyflow/react';
import clsx from 'clsx';

import { useTx } from '@/i18n';
import { type RSForm } from '@rsconcept/domain/library/rsform';
import { type AstNode, type FlatAstNode } from '@rsconcept/domain/parsing';
import { readErrorAnnotation, readTypeAnnotation, TokenID } from '@rsconcept/domain/rslang';
import { labelRSLangNode, labelType } from '@rsconcept/domain/rslang/labels';

import { useValueTooltipAnchor } from '@/hooks/use-value-tooltip-anchor';

import { colorBgSyntaxTree } from '../../../colors';
import { describeRSError } from '../../../labels';
import { useShowAstSchema } from '../show-ast-schema-context';

import { type AstGraphNode } from './ast-models';

const LABEL_THRESHOLD = 3;

export function ASTNodeComponent(node: NodeProps<AstGraphNode>) {
  const tx = useTx();
  const schema = useShowAstSchema();
  const label = labelRSLangNode(node.data);
  const errorData = readErrorAnnotation(node.data as AstNode);
  const errorMessage = errorData ? describeRSError(errorData.code, errorData.params ?? []) : '';
  const tooltipText = buildTooltip(node.data, schema, errorMessage, tx);
  const tooltipAnchor = useValueTooltipAnchor(tooltipText || null);

  return (
    <>
      <Handle type='target' position={Position.Top} className='opacity-0' />
      <div
        className={clsx(
          'w-full h-full cursor-default flex items-center justify-center rounded-full',
          errorMessage && 'ring-2 ring-destructive ring-offset-2 ring-offset-background'
        )}
        style={{ backgroundColor: colorBgSyntaxTree(node.data) }}
        {...tooltipAnchor}
      />
      <Handle type='source' position={Position.Bottom} className='opacity-0' />
      <div
        className={clsx(
          'mt-[4px] w-fit translate-x-[calc(-50%+20px)]',
          'font-math text-center ',
          label.length > LABEL_THRESHOLD ? 'text-[12px]/[16px]' : 'text-[14px]/[20px]'
        )}
        {...tooltipAnchor}
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
  const typeLine = type ? `${tx('tx.rslang.type')}${tx('tx.general.colon')}${labelType(type)}` : '';
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
        extra = `${tx('tx.lang.term')}${tx('tx.general.colon')}${termText}`;
      }
    }
  } else if (data.typeID === TokenID.ID_RADICAL && schema) {
    extra = `${tx('tx.rslang.template.parameter')}${tx('tx.general.colon')}${alias}`;
  }

  const parts = [typeLine, errorBlock, extra].filter(Boolean);
  return parts.join(parts.length > 0 ? '\n' : '');
}
