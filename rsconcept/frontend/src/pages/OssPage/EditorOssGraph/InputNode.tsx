import { Handle, Position } from 'reactflow';

import { IconDestroy, IconEdit2 } from '@/components/Icons';
import MiniButton from '@/components/ui/MiniButton.tsx';

import { useOssEdit } from '../OssEditContext';

interface InputNodeProps {
  id: string;
  data: {
    label: string;
  };
}

function InputNode({ id, data }: InputNodeProps) {
  const controller = useOssEdit();
  console.log(controller.isMutable);

  const handleDelete = () => {
    console.log('delete node ' + id);
  };

  const handleEditOperation = () => {
    console.log('edit operation ' + id);
    //controller.selectNode(id);
    //controller.showSynthesis();
  };

  return (
    <>
      <Handle type='source' position={Position.Bottom} />
      <div className='flex justify-between items-center'>
        <div className='flex-grow text-center'>{data.label}</div>
        <div className='cc-icons'>
          <MiniButton
            icon={<IconEdit2 className='icon-primary' size='0.75rem' />}
            noPadding
            title='Редактировать'
            onClick={() => {
              handleEditOperation();
            }}
          />
          <MiniButton
            noPadding
            icon={<IconDestroy className='icon-red' size='0.75rem' />}
            title='Удалить операцию'
            onClick={handleDelete}
          />
        </div>
      </div>
    </>
  );
}

export default InputNode;
