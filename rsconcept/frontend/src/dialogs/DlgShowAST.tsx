'use client';

import { useCallback, useMemo, useState } from 'react';

import Modal, { ModalProps } from '@/components/Common/Modal';
import GraphUI, { GraphEdge, GraphNode } from '@/components/GraphUI';
import { useConceptTheme } from '@/context/ThemeContext';
import { SyntaxTree } from '@/models/rslang';
import { graphDarkT, graphLightT } from '@/utils/color';
import { colorBgSyntaxTree } from '@/utils/color';
import { resources } from '@/utils/constants';
import { labelSyntaxTree } from '@/utils/labels';

interface DlgShowASTProps extends Pick<ModalProps, 'hideWindow'> {
  syntaxTree: SyntaxTree;
  expression: string;
}

function DlgShowAST({ hideWindow, syntaxTree, expression }: DlgShowASTProps) {
  const { darkMode, colors } = useConceptTheme();
  const [hoverID, setHoverID] = useState<number | undefined>(undefined);
  const hoverNode = useMemo(() => syntaxTree.find(node => node.uid === hoverID), [hoverID, syntaxTree]);

  const nodes: GraphNode[] = useMemo(
    () =>
      syntaxTree.map(node => ({
        id: String(node.uid),
        label: labelSyntaxTree(node),
        fill: colorBgSyntaxTree(node, colors)
      })),
    [syntaxTree, colors]
  );

  const edges: GraphEdge[] = useMemo(() => {
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

  const handleHoverIn = useCallback((node: GraphNode) => setHoverID(Number(node.id)), []);

  const handleHoverOut = useCallback(() => setHoverID(undefined), []);

  return (
    <Modal readonly hideWindow={hideWindow} className='px-6'>
      <div className='my-2 text-lg text-center'>
        {!hoverNode ? expression : null}
        {hoverNode ? (
          <div>
            <span>{expression.slice(0, hoverNode.start)}</span>
            <span className='clr-selected'>{expression.slice(hoverNode.start, hoverNode.finish)}</span>
            <span>{expression.slice(hoverNode.finish)}</span>
          </div>
        ) : null}
      </div>
      <div
        className='relative'
        style={{
          width: 'calc(100vw - 6rem - 2px)',
          height: 'calc(100vh - 14rem - 2px)'
        }}
      >
        <GraphUI
          nodes={nodes}
          edges={edges}
          layoutType='hierarchicalTd'
          labelFontUrl={resources.graph_font}
          theme={darkMode ? graphDarkT : graphLightT}
          onNodePointerOver={handleHoverIn}
          onNodePointerOut={handleHoverOut}
        />
      </div>
    </Modal>
  );
}

export default DlgShowAST;
