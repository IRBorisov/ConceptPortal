'use client';

import { useCallback, useMemo, useState } from 'react';

import BadgeHelp from '@/components/info/BadgeHelp';
import GraphUI, { GraphEdge, GraphNode } from '@/components/ui/GraphUI';
import Modal, { ModalProps } from '@/components/ui/Modal';
import Overlay from '@/components/ui/Overlay';
import { useConceptOptions } from '@/context/OptionsContext';
import { HelpTopic } from '@/models/miscellaneous';
import { SyntaxTree } from '@/models/rslang';
import { graphDarkT, graphLightT } from '@/styling/color';
import { colorBgSyntaxTree } from '@/styling/color';
import { PARAMETER, resources } from '@/utils/constants';
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
      <Overlay position='left-[-1rem] top-[0.25rem]'>
        <BadgeHelp topic={HelpTopic.UI_FORMULA_TREE} className={PARAMETER.TOOLTIP_WIDTH} />
      </Overlay>
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
      <div className='relative w-[calc(100vw-6rem-2px)] h-[calc(100svh-14rem-2px)]'>
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
