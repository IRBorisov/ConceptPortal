import { useMemo } from 'react';
import { darkTheme, GraphCanvas, GraphEdge, GraphNode, lightTheme } from 'reagraph';

import Modal from '../../components/Common/Modal';
import { useConceptTheme } from '../../context/ThemeContext';
import { resources } from '../../utils/constants';
import { SyntaxTree } from '../../utils/models';
import { getNodeLabel } from '../../utils/staticUI';

interface DlgShowASTProps {
  hideWindow: () => void
  syntaxTree: SyntaxTree
  expression: string
}

function DlgShowAST({ hideWindow, syntaxTree, expression }: DlgShowASTProps) {
  const { darkMode } = useConceptTheme();
  
  const nodes: GraphNode[] = useMemo(
  () => syntaxTree.map(node => {
    return {
      id: String(node.uid),
      label: getNodeLabel(node)
    };
  }), [syntaxTree]);

  const edges: GraphEdge[] = useMemo(
  () => {
    const result: GraphEdge[] = [];
    syntaxTree.forEach(node => {
      if (node.parent !== node.uid) {
        result.push({
          id: String(node.uid),
          source: String(node.parent),
          target: String(node.uid)
        });
      }
    });
    return result;
  }, [syntaxTree]);

  return (
    <Modal
      hideWindow={hideWindow}
      readonly
    >
      <div className='flex flex-col items-start gap-2'>
        <div className='w-full text-lg text-center'>{expression}</div>
        <div className='flex-wrap w-full h-full overflow-auto'>
        <div className='relative w-[1040px] h-[600px] 2xl:w-[1680px] 2xl:h-[600px] max-h-full max-w-full'>
          <GraphCanvas
            nodes={nodes}
            edges={edges}
            layoutType='hierarchicalTd'
            labelFontUrl={resources.graph_font}
            theme={darkMode ? darkTheme : lightTheme}
          />
        </div>
        </div>
      </div>
    </Modal>
  );
}

export default DlgShowAST;
