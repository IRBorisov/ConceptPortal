'use client';

import { useCallback, useMemo, useState } from 'react';

import GraphUI, { GraphEdge, GraphNode } from '@/components/ui/GraphUI';
import Modal, { ModalProps } from '@/components/ui/Modal';
import Overlay from '@/components/ui/Overlay';
import { useConceptOptions } from '@/context/ConceptOptionsContext';
import { HelpTopic } from '@/models/miscellaneous';
import { SyntaxTree } from '@/models/rslang';
import { graphDarkT, graphLightT } from '@/styling/color';
import { colorBgSyntaxTree } from '@/styling/color';
import { resources } from '@/utils/constants';
import { labelSyntaxTree } from '@/utils/labels';

interface DlgShowASTProps extends Pick<ModalProps, 'hideWindow'> {
  syntaxTree: SyntaxTree;
  expression: string;
}

function DlgShowAST({ hideWindow, syntaxTree, expression }: DlgShowASTProps) {
  const { darkMode, colors } = useConceptOptions();
  const [hoverID, setHoverID] = useState<number | undefined>(undefined);
  const hoverNode = useMemo(() => syntaxTree.find(node => node.uid === hoverID), [hoverID, syntaxTree]);

  const nodes: GraphNode[] = useMemo(
    () =>
      syntaxTree.map(node => ({
        id: String(syntaxTree.length - node.uid), // invert order of IDs to force correct ordering in graph layout
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
          source: String(syntaxTree.length - node.parent),
          target: String(syntaxTree.length - node.uid)
        });
      }
    });
    return result;
  }, [syntaxTree]);

  const handleHoverIn = useCallback((node: GraphNode) => setHoverID(syntaxTree.length - Number(node.id)), [syntaxTree]);

  const handleHoverOut = useCallback(() => setHoverID(undefined), []);

  return (
    <Modal
      readonly
      hideWindow={hideWindow}
      className='flex flex-col justify-stretch w-[calc(100dvw-3rem)] h-[calc(100dvh-6rem)]'
      helpTopic={HelpTopic.UI_FORMULA_TREE}
    >
      <Overlay
        position='top-2 right-1/2 translate-x-1/2'
        className='px-2 py-1 rounded-2xl cc-blur max-w-[60ch] text-lg text-center'
        style={{ backgroundColor: colors.bgBlur }}
      >
        {!hoverNode ? expression : null}
        {hoverNode ? (
          <div>
            <span>{expression.slice(0, hoverNode.start)}</span>
            <span className='clr-selected'>{expression.slice(hoverNode.start, hoverNode.finish)}</span>
            <span>{expression.slice(hoverNode.finish)}</span>
          </div>
        ) : null}
      </Overlay>
      <div className='flex-grow relative'>
        <GraphUI
          animated={false}
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
