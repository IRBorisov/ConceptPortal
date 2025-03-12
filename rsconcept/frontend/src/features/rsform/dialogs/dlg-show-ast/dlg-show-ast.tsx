'use client';

import { useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import clsx from 'clsx';

import { HelpTopic } from '@/features/help';

import { ModalView } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';

import { type SyntaxTree } from '../../models/rslang';

import { ASTFlow } from './ast-flow';

export interface DlgShowASTProps {
  syntaxTree: SyntaxTree;
  expression: string;
}

export function DlgShowAST() {
  const { syntaxTree, expression } = useDialogsStore(state => state.props as DlgShowASTProps);
  const [hoverID, setHoverID] = useState<number | null>(null);
  const hoverNode = syntaxTree.find(node => node.uid === hoverID);

  const [isDragging, setIsDragging] = useState(false);

  return (
    <ModalView className='relative w-[calc(100dvw-3rem)] h-[calc(100dvh-6rem)]' helpTopic={HelpTopic.UI_FORMULA_TREE}>
      <div
        className={clsx(
          'absolute z-pop top-2 right-1/2 translate-x-1/2 max-w-[60ch]',
          'px-2 rounded-2xl',
          'cc-blur bg-prim-100',
          'text-lg text-center'
        )}
      >
        {!hoverNode || isDragging ? expression : null}
        {!isDragging && hoverNode ? (
          <div>
            <span>{expression.slice(0, hoverNode.start)}</span>
            <span className='clr-selected'>{expression.slice(hoverNode.start, hoverNode.finish)}</span>
            <span>{expression.slice(hoverNode.finish)}</span>
          </div>
        ) : null}
      </div>

      <ReactFlowProvider>
        <ASTFlow
          data={syntaxTree}
          onNodeEnter={node => setHoverID(Number(node.id))}
          onNodeLeave={() => setHoverID(null)}
          onChangeDragging={setIsDragging}
        />
      </ReactFlowProvider>
    </ModalView>
  );
}
