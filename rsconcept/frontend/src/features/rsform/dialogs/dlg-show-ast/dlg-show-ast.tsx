'use client';

import { useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import clsx from 'clsx';
import { useDebounce } from 'use-debounce';

import { HelpTopic } from '@/features/help';

import { ModalView } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';

import { type SyntaxTree } from '../../models/rslang';

import { ASTFlow } from './ast-flow';

const NODE_POPUP_DELAY = 100;

export interface DlgShowASTProps {
  syntaxTree: SyntaxTree;
  expression: string;
}

export function DlgShowAST() {
  const { syntaxTree, expression } = useDialogsStore(state => state.props as DlgShowASTProps);
  const [hoverID, setHoverID] = useState<number | null>(null);
  const hoverNode = syntaxTree.find(node => node.uid === hoverID);
  const [hoverNodeDebounced] = useDebounce(hoverNode, NODE_POPUP_DELAY);

  const [isDragging, setIsDragging] = useState(false);

  return (
    <ModalView
      className='relative w-[calc(100dvw-3rem)] h-[calc(100dvh-3rem)] cc-mask-sides'
      helpTopic={HelpTopic.UI_FORMULA_TREE}
      fullScreen
    >
      <div
        className={clsx(
          'absolute z-pop top-2 right-1/2 translate-x-1/2 max-w-[60ch]',
          'px-2 rounded-2xl',
          'backdrop-blur-xs bg-background/90',
          'text-lg text-center'
        )}
      >
        {!hoverNodeDebounced || isDragging ? expression : null}
        {!isDragging && hoverNodeDebounced ? (
          <div key={hoverNodeDebounced.uid}>
            <span>{expression.slice(0, hoverNodeDebounced.start)}</span>
            <span className='bg-selected cc-animate-background starting:bg-background duration-500'>
              {expression.slice(hoverNodeDebounced.start, hoverNodeDebounced.finish)}
            </span>
            <span>{expression.slice(hoverNodeDebounced.finish)}</span>
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
