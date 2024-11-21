'use client';

import { useCallback, useMemo, useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { Node } from 'reactflow';

import Modal, { ModalProps } from '@/components/ui/Modal';
import Overlay from '@/components/ui/Overlay';
import { useConceptOptions } from '@/context/ConceptOptionsContext';
import { HelpTopic } from '@/models/miscellaneous';
import { SyntaxTree } from '@/models/rslang';

import ASTFlow from './ASTFlow';

interface DlgShowASTProps extends Pick<ModalProps, 'hideWindow'> {
  syntaxTree: SyntaxTree;
  expression: string;
}

function DlgShowAST({ hideWindow, syntaxTree, expression }: DlgShowASTProps) {
  const { colors } = useConceptOptions();
  const [hoverID, setHoverID] = useState<number | undefined>(undefined);
  const hoverNode = useMemo(() => syntaxTree.find(node => node.uid === hoverID), [hoverID, syntaxTree]);

  const handleHoverIn = useCallback((node: Node) => setHoverID(Number(node.id)), []);
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
      <ReactFlowProvider>
        <ASTFlow data={syntaxTree} onNodeEnter={handleHoverIn} onNodeLeave={handleHoverOut} />
      </ReactFlowProvider>
    </Modal>
  );
}

export default DlgShowAST;
