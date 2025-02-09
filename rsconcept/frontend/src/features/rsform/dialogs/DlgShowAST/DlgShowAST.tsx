'use client';

import { useState } from 'react';
import { ReactFlowProvider } from 'reactflow';

import { Overlay } from '@/components/Container';
import { ModalView } from '@/components/Modal';
import { HelpTopic } from '@/features/help/models/helpTopic';
import { useDialogsStore } from '@/stores/dialogs';

import { SyntaxTree } from '../../models/rslang';
import ASTFlow from './ASTFlow';

export interface DlgShowASTProps {
  syntaxTree: SyntaxTree;
  expression: string;
}

function DlgShowAST() {
  const { syntaxTree, expression } = useDialogsStore(state => state.props as DlgShowASTProps);
  const [hoverID, setHoverID] = useState<number | undefined>(undefined);
  const hoverNode = syntaxTree.find(node => node.uid === hoverID);

  const [isDragging, setIsDragging] = useState(false);

  return (
    <ModalView
      className='flex flex-col justify-stretch w-[calc(100dvw-3rem)] h-[calc(100dvh-6rem)]'
      helpTopic={HelpTopic.UI_FORMULA_TREE}
    >
      <Overlay
        position='top-2 right-1/2 translate-x-1/2'
        className='px-2 py-1 rounded-2xl cc-blur bg-prim-100 max-w-[60ch] text-lg text-center'
      >
        {!hoverNode || isDragging ? expression : null}
        {!isDragging && hoverNode ? (
          <div>
            <span>{expression.slice(0, hoverNode.start)}</span>
            <span className='clr-selected'>{expression.slice(hoverNode.start, hoverNode.finish)}</span>
            <span>{expression.slice(hoverNode.finish)}</span>
          </div>
        ) : null}
      </Overlay>
      <ReactFlowProvider>
        <ASTFlow
          data={syntaxTree}
          onNodeEnter={node => setHoverID(Number(node.id))}
          onNodeLeave={() => setHoverID(undefined)}
          onChangeDragging={setIsDragging}
        />
      </ReactFlowProvider>
    </ModalView>
  );
}

export default DlgShowAST;
