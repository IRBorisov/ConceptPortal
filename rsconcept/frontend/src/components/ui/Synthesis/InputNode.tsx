import { Handle, Position } from '@reactflow/core';
import { type FC, memo } from 'react';
import { CiSquareRemove } from 'react-icons/ci';
import { PiPlugsConnected } from 'react-icons/pi';

import MiniButton from '@/components/ui/MiniButton.tsx';
import { useSynthesis } from '@/pages/OssPage/SynthesisContext.tsx';

interface InputNodeProps {
  id: string;
  data: {
    label: string;
    onDelete: (nodeId: string) => void;
  };
}

const InputNode: FC<InputNodeProps> = ({ id, data }) => {
  const controller = useSynthesis();

  const handleDelete = () => {
    data.onDelete(id);
  };

  const handleClick = () => {
    controller.selectNode(id);
    controller.showSelectInput();
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
          Схема:{controller.getBind(id) === undefined ? '' : controller.getBind(id)}
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
};

export default memo(InputNode);
