'use client';

import { type NodeProps } from '@xyflow/react';

import { useTx } from '@/i18n';
import { OperationType } from '@rsconcept/domain/library';

import { IconConsolidation, IconRSForm, IconRSFormImported, IconRSFormOwned } from '@/components/icons';
import { cn } from '@/components/utils';
import { Indicator } from '@/components/view';
import { globalIDs } from '@/utils/constants';

import { useOperationTooltipStore } from '../../../../stores/operation-tooltip';
import { useOSSGraphStore } from '../../../../stores/oss-graph';
import { useOssEdit } from '../../oss-edit-context';

import { type OGOperationNode } from './og-models';

// characters - threshold for long labels - small font
const LONG_LABEL_CHARS = 14;

export function NodeCoreComponent({ node }: { node: NodeProps<OGOperationNode> }) {
  const tx = useTx();
  const { selectedItems, schema } = useOssEdit();
  const opType = node.data.operation.operation_type;

  const focus = selectedItems.length === 1 ? selectedItems[0] : null;
  const isChild = (!!focus && schema.hierarchy.at(focus.nodeID)?.outputs.includes(node.data.operation.nodeID)) ?? false;

  const setHover = useOperationTooltipStore(state => state.setHoverItem);
  const showCoordinates = useOSSGraphStore(state => state.showCoordinates);

  const hasFile = !!node.data.operation.result;
  const isInput = node.data.operation.operation_type === OperationType.INPUT;
  const isImport = node.data.operation.operation_type === OperationType.INPUT && node.data.operation.is_import;
  const longLabel = node.data.label.length > LONG_LABEL_CHARS;

  function attachmentTitle() {
    if (!hasFile) {
      return tx('tx.operation.attachment.none');
    } else if (isImport) {
      return tx('tx.oss.input.import');
    } else if (isInput) {
      return tx('tx.operation.attachment.original');
    } else {
      return tx('tx.operation.attachment');
    }
  }

  function attachmentIcon() {
    if (!hasFile) {
      return <IconRSForm className='text-destructive' size='12px' />;
    } else if (isImport) {
      return <IconRSFormImported className='text-constructive' size='12px' />;
    } else if (isInput) {
      return <IconRSFormOwned className='text-constructive' size='12px' />;
    } else {
      return <IconRSForm className='text-constructive' size='12px' />;
    }
  }

  return (
    <div
      className={cn(
        'cc-node-operation h-[40px] w-[150px]',
        'relative flex items-center justify-center p-[2px]',
        opType === OperationType.REPLICA && 'border-dashed',
        !isChild && opType === OperationType.SYNTHESIS && !node.data.operation.has_additions && 'destructive',
        isChild && 'border-accent-orange'
      )}
    >
      <div className='absolute z-pop top-0 right-0 flex flex-col gap-[4px] p-[2px]'>
        <Indicator noPadding title={attachmentTitle()} icon={attachmentIcon()} />
        {opType === OperationType.SYNTHESIS && node.data.operation.is_consolidation ? (
          <Indicator
            noPadding
            title={tx('tx.synthesis.rhombus.hint')}
            icon={<IconConsolidation className='text-primary' size='12px' />}
          />
        ) : null}
      </div>
      {showCoordinates ? (
        <div
          className={cn(
            'absolute top-full mt-[4px] right-px',
            'text-[7px]/[8px] font-math',
            'text-muted-foreground hover:text-foreground',
            node.selected && 'translate-y-[6px]'
          )}
        >
          {`X: ${node.positionAbsoluteX.toFixed(0)} Y: ${node.positionAbsoluteY.toFixed(0)}`}
        </div>
      ) : null}

      <div
        className='w-full h-full flex items-center justify-center px-[14px]'
        data-tooltip-id={globalIDs.operation_tooltip}
        onMouseEnter={() => setHover(node.data.operation)}
      >
        <div
          className={cn(
            'text-center line-clamp-2 wrap-break-word',
            longLabel ? 'text-[10px]/[14px]' : 'text-[14px]/[20px]'
          )}
        >
          {node.data.label}
        </div>
      </div>
    </div>
  );
}
