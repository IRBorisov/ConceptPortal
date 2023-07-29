import Modal from '../../components/Common/Modal';
import PrettyJson from '../../components/Common/PrettyJSON';
import { SyntaxTree } from '../../utils/models';

interface DlgShowASTProps {
  hideWindow: () => void
  syntaxTree: SyntaxTree
}

function DlgShowAST({ hideWindow, syntaxTree }: DlgShowASTProps) {
  const handleSubmit = () => {
    // Do nothing
  };

  return (
    <Modal
      title='Просмотр дерева разбора'
      hideWindow={hideWindow}
      onSubmit={handleSubmit}
      submitText='Закрыть'
      canSubmit={true}
    >
      <div className='max-w-[40rem] max-h-[30rem] overflow-auto'>
        <PrettyJson data={syntaxTree}/>
      </div>
    </Modal>
  );
}

export default DlgShowAST;
