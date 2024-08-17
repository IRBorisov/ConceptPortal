import { Handle, Position } from 'reactflow';

import { IconRSForm } from '@/components/Icons';
import TooltipOperation from '@/components/info/TooltipOperation';
import MiniButton from '@/components/ui/MiniButton.tsx';
import Overlay from '@/components/ui/Overlay';
import { OssNodeInternal } from '@/models/miscellaneous';
import { prefixes } from '@/utils/constants';

import { useOssEdit } from '../OssEditContext';

function InputNode(node: OssNodeInternal) {
  const controller = useOssEdit();
  const hasFile = !!node.data.operation.result;

  const handleOpenSchema = () => {
    controller.openOperationSchema(Number(node.id));
  };

  return (
    <>
      <Handle type='source' position={Position.Bottom} />

      <Overlay position='top-0 right-0' className='flex'>
        <MiniButton
          icon={<IconRSForm className={hasFile ? 'clr-text-green' : 'clr-text-red'} size='0.75rem' />}
          noHover
          noPadding
          title={hasFile ? 'Связанная КС' : 'Нет связанной КС'}
          hideTitle={!controller.showTooltip}
          onClick={() => {
            handleOpenSchema();
          }}
          disabled={!hasFile}
        />
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
    </>
  );
}

export default InputNode;
