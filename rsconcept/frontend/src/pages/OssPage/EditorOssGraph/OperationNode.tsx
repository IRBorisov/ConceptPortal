import { Handle, Position } from 'reactflow';

import { IconConsolidation, IconRSForm } from '@/components/Icons';
import TooltipOperation from '@/components/info/TooltipOperation';
import MiniButton from '@/components/ui/MiniButton.tsx';
import Overlay from '@/components/ui/Overlay';
import { OssNodeInternal } from '@/models/miscellaneous';
import { prefixes } from '@/utils/constants';

import { useOssEdit } from '../OssEditContext';

function OperationNode(node: OssNodeInternal) {
  const controller = useOssEdit();

  const hasFile = !!node.data.operation.result;

  const handleOpenSchema = () => {
    controller.openOperationSchema(Number(node.id));
  };

  return (
    <>
      <Handle type='source' position={Position.Bottom} />

      <Overlay position='top-0 right-0' className='flex flex-col gap-1'>
        <MiniButton
          icon={
            <IconRSForm
              className={hasFile ? 'clr-text-green' : 'clr-text-red'}
              size={node.data.operation.is_consolidation ? '0.6rem' : '0.75rem'}
            />
          }
          noHover
          noPadding
          title={hasFile ? 'Связанная КС' : 'Нет связанной КС'}
          hideTitle={!controller.showTooltip}
          onClick={handleOpenSchema}
          disabled={!hasFile}
        />
        {node.data.operation.is_consolidation ? (
          <MiniButton
            icon={<IconConsolidation className='clr-text-primary' size='0.6rem' />}
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

      <div id={`${prefixes.operation_list}${node.id}`} className='flex-grow text-center'>
        {node.data.label}
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
