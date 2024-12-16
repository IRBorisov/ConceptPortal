'use client';

import { IconConsolidation, IconRSForm } from '@/components/Icons';
import TooltipOperation from '@/components/info/TooltipOperation';
import Indicator from '@/components/ui/Indicator';
import Overlay from '@/components/ui/Overlay';
import { OssNodeInternal } from '@/models/miscellaneous';
import { OperationType } from '@/models/oss';
import { PARAMETER, prefixes } from '@/utils/constants';
import { truncateToLastWord } from '@/utils/utils';

import { useOssEdit } from '../../OssEditContext';

interface NodeCoreProps {
  node: OssNodeInternal;
}

function NodeCore({ node }: NodeCoreProps) {
  const controller = useOssEdit();

  const hasFile = !!node.data.operation.result;
  const longLabel = node.data.label.length > PARAMETER.ossLongLabel;
  const labelText = truncateToLastWord(node.data.label, PARAMETER.ossTruncateLabel);

  return (
    <>
      <Overlay position='top-0 right-0' className='flex flex-col gap-1 p-[2px]'>
        <Indicator
          noPadding
          title={hasFile ? 'Связанная КС' : 'Нет связанной КС'}
          icon={<IconRSForm className={hasFile ? 'text-ok-600' : 'text-warn-600'} size='12px' />}
          hideTitle={!controller.showTooltip}
        />
        {node.data.operation.is_consolidation ? (
          <Indicator
            noPadding
            titleHtml='<b>Внимание!</b><br />Ромбовидный синтез</br/>Возможны дубликаты конституент'
            icon={<IconConsolidation className='clr-text-primary' size='12px' />}
            hideTitle={!controller.showTooltip}
          />
        ) : null}
      </Overlay>

      {node.data.operation.operation_type === OperationType.INPUT ? (
        <Overlay position='top-[1px] right-1/2 translate-x-1/2' className='flex'>
          <div className='border-t w-[30px]'></div>
        </Overlay>
      ) : null}

      {!node.data.operation.is_owned ? (
        <Overlay position='left-[2px] top-[6px]'>
          <div className='border-r rounded-none clr-input h-[22px]'></div>
        </Overlay>
      ) : null}

      <div id={`${prefixes.operation_list}${node.id}`} className='h-[34px] w-[144px] flex items-center justify-center'>
        <div
          className='text-center'
          style={{
            fontSize: longLabel ? '12px' : '14px',
            lineHeight: longLabel ? '16px' : '20px',
            paddingLeft: '4px',
            paddingRight: longLabel ? '10px' : '4px'
          }}
        >
          {labelText}
        </div>
        {controller.showTooltip && !node.dragging ? (
          <TooltipOperation anchor={`#${prefixes.operation_list}${node.id}`} node={node} />
        ) : null}
      </div>
    </>
  );
}

export default NodeCore;
