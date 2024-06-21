import { Handle, Position } from '@reactflow/core';
import { type CSSProperties, type FC, memo } from 'react';
import { CiSquareRemove } from 'react-icons/ci';
import { IoGitNetworkSharp } from 'react-icons/io5';
import { VscDebugStart } from 'react-icons/vsc';

import MiniButton from '@/components/ui/MiniButton.tsx';
import { useSynthesis } from '@/pages/OssPage/SynthesisContext.tsx';

const sourceHandleStyleA: CSSProperties = { left: 50 };
const sourceHandleStyleB: CSSProperties = {
  right: 50,
  left: 'auto'
};

interface OperationNodeProps {
  id: string;
  data: {
    label: string;
    onDelete: (nodeId: string) => void;
  };
  xPos: number;
  yPos: number;
}

const OperationNode: FC<OperationNodeProps> = ({ id, data, xPos, yPos }) => {
  const controller = useSynthesis();
  const { label, onDelete } = data;

  const handleDelete = () => {
    onDelete(id);
  };

  const handleSubstitution = () => {
    controller.selectNode(id);
    controller.showSynthesis();
  };

  const handleSynthesis = () => {
    controller.singleSynthesis(id);
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
          Тип: <strong>Отождествление</strong>
        </div>
        <div>
          Схема: <strong></strong>
          <MiniButton
            className='float-right'
            icon={<VscDebugStart className='icon-green' />}
            title='Синтез'
            onClick={() => handleSynthesis()}
          />
          <MiniButton
            className='float-right'
            icon={<IoGitNetworkSharp className='icon-green' />}
            title='Отождествления'
            onClick={() => handleSubstitution()}
          />
        </div>
      </div>

      <Handle type='source' position={Position.Top} id='a' style={sourceHandleStyleA} />
      <Handle type='source' position={Position.Top} id='b' style={sourceHandleStyleB} />
    </>
  );
};

export default memo(OperationNode);
