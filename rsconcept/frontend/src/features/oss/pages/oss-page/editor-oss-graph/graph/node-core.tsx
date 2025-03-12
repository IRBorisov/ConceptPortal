'use client';

import { IconConsolidation, IconRSForm } from '@/components/icons';
import { Indicator } from '@/components/view';
import { globalIDs } from '@/utils/constants';

import { OperationType } from '../../../../backend/types';
import { type OssNodeInternal } from '../../../../models/oss-layout';
import { useOperationTooltipStore } from '../../../../stores/operation-tooltip';

// characters - threshold for long labels - small font
const LONG_LABEL_CHARS = 14;

interface NodeCoreProps {
  node: OssNodeInternal;
}

export function NodeCore({ node }: NodeCoreProps) {
  const setHover = useOperationTooltipStore(state => state.setActiveOperation);

  const hasFile = !!node.data.operation.result;
  const longLabel = node.data.label.length > LONG_LABEL_CHARS;

  return (
    <div
      className='relative h-[34px] w-[144px] flex items-center justify-center'
      data-tooltip-id={globalIDs.operation_tooltip}
      data-tooltip-hidden={node.dragging}
      onMouseEnter={() => setHover(node.data.operation)}
    >
      <div className='absolute z-pop top-0 right-0 flex flex-col gap-1 p-[2px]'>
        <Indicator
          noPadding
          title={hasFile ? 'Связанная КС' : 'Нет связанной КС'}
          icon={<IconRSForm className={hasFile ? 'text-ok-600' : 'text-warn-600'} size='12px' />}
        />
        {node.data.operation.is_consolidation ? (
          <Indicator
            noPadding
            titleHtml='<b>Внимание!</b><br />Ромбовидный синтез</br/>Возможны дубликаты конституент'
            icon={<IconConsolidation className='text-sec-600' size='12px' />}
          />
        ) : null}
      </div>

      {node.data.operation.operation_type === OperationType.INPUT ? (
        <div className='absolute top-[1px] right-1/2 translate-x-1/2 border-t w-[30px]' />
      ) : null}

      {!node.data.operation.is_owned ? (
        <div className='absolute left-[2px] top-[6px] border-r rounded-none clr-input h-[22px]' />
      ) : null}

      <div
        className='text-center line-clamp-2'
        style={{
          fontSize: longLabel ? '12px' : '14px',
          lineHeight: longLabel ? '16px' : '20px',
          paddingLeft: '4px',
          paddingRight: longLabel ? '10px' : '4px'
        }}
      >
        {node.data.label}
      </div>
    </div>
  );
}
