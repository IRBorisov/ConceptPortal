'use client';

import clsx from 'clsx';

import { useOSSGraphStore } from '@/features/oss/stores/oss-graph';

import { IconConsolidation, IconRSForm } from '@/components/icons';
import { cn } from '@/components/utils';
import { Indicator } from '@/components/view';
import { globalIDs } from '@/utils/constants';

import { OperationType } from '../../../../backend/types';
import { type OperationInternalNode } from '../../../../models/oss-layout';
import { useOperationTooltipStore } from '../../../../stores/operation-tooltip';
import { useOssEdit } from '../../oss-edit-context';

export const OPERATION_NODE_WIDTH = 150;
export const OPERATION_NODE_HEIGHT = 40;

// characters - threshold for long labels - small font
const LONG_LABEL_CHARS = 14;

interface NodeCoreProps {
  node: OperationInternalNode;
}

export function NodeCore({ node }: NodeCoreProps) {
  const { selected, schema } = useOssEdit();
  const focus = selected.length === 1 ? selected[0] : null;
  const isChild = (!!focus && schema.hierarchy.at(focus)?.outputs.includes(node.data.operation.id)) ?? false;

  const setHover = useOperationTooltipStore(state => state.setHoverItem);
  const showCoordinates = useOSSGraphStore(state => state.showCoordinates);

  const hasFile = !!node.data.operation.result;
  const longLabel = node.data.label.length > LONG_LABEL_CHARS;

  return (
    <div
      className={cn(
        'cc-node-operation h-[40px] w-[150px]',
        'relative flex items-center justify-center p-[2px]',
        isChild && 'border-accent-orange50!'
      )}
      data-tooltip-id={globalIDs.operation_tooltip}
      data-tooltip-hidden={node.dragging}
      onMouseEnter={() => setHover(node.data.operation)}
    >
      <div className='absolute z-pop top-0 right-0 flex flex-col gap-1 p-[2px]'>
        <Indicator
          noPadding
          title={hasFile ? 'Связанная КС' : 'Нет связанной КС'}
          icon={<IconRSForm className={hasFile ? 'text-constructive' : 'text-destructive'} size='12px' />}
        />
        {node.data.operation.is_consolidation ? (
          <Indicator
            noPadding
            titleHtml='<b>Внимание!</b><br />Ромбовидный синтез</br/>Возможны дубликаты конституент'
            icon={<IconConsolidation className='text-primary' size='12px' />}
          />
        ) : null}
      </div>
      {showCoordinates ? (
        <div
          className={clsx(
            'absolute top-full mt-1 right-[1px]',
            'text-[7px]/[8px] font-math',
            'text-muted-foreground hover:text-foreground',
            node.selected && 'translate-y-[6px]'
          )}
        >
          {`X: ${node.xPos.toFixed(0)} Y: ${node.yPos.toFixed(0)}`}
        </div>
      ) : null}

      {node.data.operation.operation_type === OperationType.INPUT ? (
        <div className='absolute top-[3px] right-1/2 translate-x-1/2 border-t w-[30px]' />
      ) : null}

      {!node.data.operation.is_owned ? (
        <div className='absolute left-[2px] top-[6px] border-r rounded-none bg-input h-[22px]' />
      ) : null}

      <div
        className={clsx(
          'text-center line-clamp-2 pl-[4px]',
          longLabel ? 'text-[12px]/[16px] pr-[10px]' : 'text-[14px]/[20px] pr-[4px]'
        )}
      >
        {node.data.label}
      </div>
    </div>
  );
}
