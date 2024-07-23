import { VscDebugStart } from 'react-icons/vsc';
import { Handle, Position } from 'reactflow';

import { IconDestroy, IconEdit2 } from '@/components/Icons';
import MiniButton from '@/components/ui/MiniButton.tsx';

import { useOssEdit } from '../OssEditContext';
interface OperationNodeProps {
  id: string;
  data: {
    label: string;
  };
}

function OperationNode({ id, data }: OperationNodeProps) {
  const controller = useOssEdit();
  console.log(controller.isMutable);

  const handleDelete = () => {
    console.log('delete node ' + id);
    // onDelete(id);
  };

  const handleEditOperation = () => {
    console.log('edit operation ' + id);
    //controller.selectNode(id);
    //controller.showSynthesis();
  };

  const handleRunOperation = () => {
    console.log('run operation');
    // controller.singleSynthesis(id);
  };

  return (
    <>
      <Handle type='source' position={Position.Bottom} />
      <div className='flex justify-between'>
        <div className='flex-grow text-center'>{data.label}</div>
        <div className='cc-icons'>
          <MiniButton
            icon={<IconEdit2 className='icon-primary' size='1rem' />}
            title='Редактировать'
            onClick={() => {
              handleEditOperation();
            }}
          />
          <MiniButton
            className='float-right'
            icon={<VscDebugStart className='icon-green' size='1rem' />}
            title='Синтез'
            onClick={() => handleRunOperation()}
          />
          <MiniButton
            icon={<IconDestroy className='icon-red' size='1rem' />}
            title='Удалить операцию'
            onClick={handleDelete}
          />
        </div>
      </div>

      <Handle type='target' position={Position.Top} id='left' style={{ left: 40 }} />
      <Handle type='target' position={Position.Top} id='right' style={{ right: 40, left: 'auto' }} />
    </>
  );
}

export default OperationNode;
