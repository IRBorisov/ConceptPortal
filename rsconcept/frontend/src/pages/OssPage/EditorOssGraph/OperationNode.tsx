'use client';

import { Handle, Position } from 'reactflow';

import { IconConsolidation, IconRSForm } from '@/components/Icons';
import TooltipOperation from '@/components/info/TooltipOperation';
import MiniButton from '@/components/ui/MiniButton.tsx';
import Overlay from '@/components/ui/Overlay';
import { OssNodeInternal } from '@/models/miscellaneous';
import { PARAMETER, prefixes } from '@/utils/constants';
import { truncateToLastWord } from '@/utils/utils';

import { useOssEdit } from '../OssEditContext';

function OperationNode(node: OssNodeInternal) {
  const controller = useOssEdit();

  const hasFile = !!node.data.operation.result;
  const longLabel = node.data.label.length > PARAMETER.ossLongLabel;
  const labelText = truncateToLastWord(node.data.label, PARAMETER.ossTruncateLabel);

  const handleOpenSchema = () => {
    controller.openOperationSchema(Number(node.id));
  };

  return (
    <>
      <Handle type='source' position={Position.Bottom} />

      <Overlay position='top-0 right-0' className='flex flex-col gap-1 p-[0.1rem]'>
        <MiniButton
          icon={<IconRSForm className={hasFile ? 'clr-text-green' : 'clr-text-red'} size='0.75rem' />}
          noHover
          noPadding
          title={hasFile ? 'Связанная КС' : 'Нет связанной КС'}
          hideTitle={!controller.showTooltip}
          onClick={handleOpenSchema}
          disabled={!hasFile}
        />
        {node.data.operation.is_consolidation ? (
          <MiniButton
            icon={<IconConsolidation className='clr-text-primary' size='0.75rem' />}
            disabled
            noPadding
            noHover
            titleHtml='<b>Внимание!</b><br />Ромбовидный синтез</br/>Возможны дубликаты конституент'
            hideTitle={!controller.showTooltip}
          />
        ) : null}
      </Overlay>

      {!node.data.operation.is_owned ? (
        <Overlay position='left-[0.2rem] top-[0.1rem]'>
          <div className='border rounded-none clr-input h-[1.3rem]'></div>
        </Overlay>
      ) : null}

      <div id={`${prefixes.operation_list}${node.id}`} className='h-[34px] w-[144px] flex items-center justify-center'>
        <div
          className='px-1 text-center'
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

      <Handle type='target' position={Position.Top} id='left' style={{ left: 40 }} />
      <Handle type='target' position={Position.Top} id='right' style={{ right: 40, left: 'auto' }} />
    </>
  );
}

export default OperationNode;
