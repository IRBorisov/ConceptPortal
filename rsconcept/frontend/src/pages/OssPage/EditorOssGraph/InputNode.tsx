import { CiSquareRemove } from 'react-icons/ci';
import { PiPlugsConnected } from 'react-icons/pi';
import { Handle, Position } from 'reactflow';

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

  const handleClick = () => {
    // controller.selectNode(id);
    // controller.showSelectInput();
  };

  return (
    <>
      <Handle type='target' position={Position.Bottom} />
      <div className='flex justify-between'>
        <div className='flex-grow text-center'>{data.label}</div>
        <div className='cc-icons'>
          <MiniButton
            icon={<PiPlugsConnected className='icon-green' />}
            title='Привязать схему'
            onClick={() => {
              handleClick();
            }}
          />
          <MiniButton
            icon={<CiSquareRemove className='icon-red' size='1rem' />}
            title='Удалить'
            onClick={handleDelete}
          />
        </div>
      </div>
    </>
  );
}

export default InputNode;
