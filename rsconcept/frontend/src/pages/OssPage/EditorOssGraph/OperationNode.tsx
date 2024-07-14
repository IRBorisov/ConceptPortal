import { CiSquareRemove } from 'react-icons/ci';
import { IoGitNetworkSharp } from 'react-icons/io5';
import { VscDebugStart } from 'react-icons/vsc';
import { Handle, Position } from 'reactflow';

import MiniButton from '@/components/ui/MiniButton.tsx';

import { useOssEdit } from '../OssEditContext';
interface OperationNodeProps {
  id: string;
}

function OperationNode({ id }: OperationNodeProps) {
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
            onClick={() => handleRunOperation()}
          />
          <MiniButton
            className='float-right'
            icon={<IoGitNetworkSharp className='icon-green' />}
            title='Отождествления'
            onClick={() => handleEditOperation()}
          />
        </div>
      </div>

      <Handle type='source' position={Position.Top} id='a' style={{ left: 50 }} />
      <Handle type='source' position={Position.Top} id='b' style={{ right: 50, left: 'auto' }} />
    </>
  );
}

export default OperationNode;
