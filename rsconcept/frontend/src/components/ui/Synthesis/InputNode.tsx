import { memo, type FC } from 'react';
import { Handle, Position, type NodeProps } from '@reactflow/core';
import Button from '@/components/ui/Button.tsx';
import { PiPlugsConnected } from 'react-icons/pi';
import { CiSquareRemove } from 'react-icons/ci';
import MiniButton from '@/components/ui/MiniButton.tsx';
import { useSynthesis } from '@/pages/OssPage/SynthesisContext.tsx';

interface InputNodeProps {
  id: string;
  data: {
    label: string;
    onDelete: (nodeId: string) => void;
  };
  bound_rsform_id: number;
}


const InputNode: FC<InputNodeProps> = ({ id, data,bound_rsform_id  }) => {
  const controller = useSynthesis();
  const { label, onDelete } = data;

  const handleDelete = () => {
    onDelete(id);
  };

  const handleClick = () =>{
    controller.selectNode(id);
    controller.showSelectInput();
  }

  return (
    <>
      <Handle type="target" position={Position.Bottom} />
      <div>
        <MiniButton className="float-right"
                    icon={<CiSquareRemove className="icon-red" />}
                    title="Удалить"
                    onClick={handleDelete}
                    color={'red'}
        />
        <div>
          Тип: <strong>Ввод</strong>
        </div>
        <div>
          Схема:{controller.getBind(id) === undefined? '': controller.getBind(id)}
          <strong>
            <MiniButton className="float-right"
                        icon={<PiPlugsConnected className="icon-green" />}
                        title="Привязать схему"
                        onClick={() => {handleClick()}}
            />
          </strong>
        </div>
      </div>

    </>
  );
};

export default memo(InputNode);
