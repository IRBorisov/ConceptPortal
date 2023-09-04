import { useCallback, useMemo, useState } from 'react';
import { GraphCanvas,GraphEdge, GraphNode } from 'reagraph';

import Modal from '../../components/Common/Modal';
import { useConceptTheme } from '../../context/ThemeContext';
import { graphDarkT, graphLightT } from '../../utils/color';
import { resources } from '../../utils/constants';
import { SyntaxTree } from '../../utils/models';
import { getASTNodeColor, getASTNodeLabel } from '../../utils/staticUI';

interface DlgShowASTProps {
  hideWindow: () => void
  syntaxTree: SyntaxTree
  expression: string
}

function DlgShowAST({ hideWindow, syntaxTree, expression }: DlgShowASTProps) {
  const { darkMode, colors } = useConceptTheme();
  const [hoverID, setHoverID] = useState<number | undefined>(undefined);
  const hoverNode = useMemo(
  () => {
    return syntaxTree.find(node => node.uid === hoverID);
  }, [hoverID, syntaxTree]);
  
  const nodes: GraphNode[] = useMemo(
  () => syntaxTree.map(node => {
    return {
      id: String(node.uid),
      label: getASTNodeLabel(node),
      fill: getASTNodeColor(node, colors),
    };
  }), [syntaxTree, colors]);

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

  const handleHoverIn = useCallback(
  (node: GraphNode) => {
    setHoverID(Number(node.id));
  }, []);

  const handleHoverOut = useCallback(
  () => {
    setHoverID(undefined);
  }, []);

  return (
    <Modal
      hideWindow={hideWindow}
      readonly
    >
      <div className='flex flex-col items-start gap-2'>
        <div className='w-full text-lg text-center'>
          {!hoverNode && expression}
          {hoverNode &&
          <div className='flex justify-center whitespace-pre'>
            <span>{expression.slice(0, hoverNode.start)}</span>
            <span className='clr-selected'>{expression.slice(hoverNode.start, hoverNode.finish)}</span>
            <span>{expression.slice(hoverNode.finish)}</span>
          </div>
          }
        </div>
        <div className='flex-wrap w-full h-full overflow-auto'>
        <div className='relative w-[1040px] h-[600px] 2xl:w-[1680px] 2xl:h-[600px] max-h-full max-w-full'>
          <GraphCanvas
            nodes={nodes}
            edges={edges}
            layoutType='hierarchicalTd'
            labelFontUrl={resources.graph_font}
            theme={darkMode ? graphDarkT : graphLightT}
            onNodePointerOver={handleHoverIn}
            onNodePointerOut={handleHoverOut}
          />
        </div>
        </div>
      </div>
    </Modal>
  );
}

export default DlgShowAST;
