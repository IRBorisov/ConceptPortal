import { CiSquareRemove } from 'react-icons/ci';
import { PiPlugsConnected } from 'react-icons/pi';
import { Handle, Position } from 'reactflow';

import MiniButton from '@/components/ui/MiniButton.tsx';

import { useOssEdit } from '../OssEditContext';

interface InputNodeProps {
  id: string;
}

function InputNode({ id }: InputNodeProps) {
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
      <div>
        <MiniButton
          className='float-right'
          icon={<CiSquareRemove className='icon-red' />}
          title='Удалить'
          onClick={handleDelete}
          color={'red'}
        />
        <div>
          Тип: <strong>Ввод</strong>
        </div>
        <div>
          {/* Схема:{controller.getBind(id) === undefined ? '' : controller.getBind(id)} */}
          <strong>
            <MiniButton
              className='float-right'
              icon={<PiPlugsConnected className='icon-green' />}
              title='Привязать схему'
              onClick={() => {
                handleClick();
              }}
            />
          </strong>
        </div>
      </div>
    </>
  );
}

export default InputNode;
