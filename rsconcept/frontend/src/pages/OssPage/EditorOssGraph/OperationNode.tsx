import { Handle, Position } from 'reactflow';

import { IconRSForm } from '@/components/Icons';
import TooltipOperation from '@/components/info/TooltipOperation';
import MiniButton from '@/components/ui/MiniButton.tsx';
import Overlay from '@/components/ui/Overlay';
import { IOperation } from '@/models/oss';
import { prefixes } from '@/utils/constants';

import { useOssEdit } from '../OssEditContext';
interface OperationNodeProps {
  id: string;
  data: {
    label: string;
    operation: IOperation;
  };
}

function OperationNode({ id, data }: OperationNodeProps) {
  const controller = useOssEdit();

  const hasFile = !!data.operation.result;

  const handleOpenSchema = () => {
    controller.openOperationSchema(Number(id));
  };

  return (
    <>
      <Handle type='source' position={Position.Bottom} />

      <Overlay position='top-[-0.2rem] right-[-0.2rem]' className='cc-icons'>
        <MiniButton
          icon={<IconRSForm className={hasFile ? 'clr-text-green' : 'clr-text-red'} size='0.75rem' />}
          noHover
          title='Связанная КС'
          onClick={() => {
            handleOpenSchema();
          }}
          disabled={!hasFile}
        />
      </Overlay>

      <div id={`${prefixes.operation_list}${id}`} className='flex-grow text-center text-sm'>
        {data.label}
        <TooltipOperation anchor={`#${prefixes.operation_list}${id}`} data={data.operation} />
      </div>

      <Handle type='target' position={Position.Top} id='left' style={{ left: 40 }} />
      <Handle type='target' position={Position.Top} id='right' style={{ right: 40, left: 'auto' }} />
    </>
  );
}

export default OperationNode;
