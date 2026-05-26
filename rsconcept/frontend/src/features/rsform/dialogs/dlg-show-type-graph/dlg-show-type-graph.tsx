'use client';

import { toast } from 'react-toastify';
import { ReactFlowProvider } from '@xyflow/react';

import { useTx } from '@/i18n';
import { type TypeInfo } from '@rsconcept/domain/library';
import { TypificationGraph } from '@rsconcept/domain/rslang';

import { HelpTopic } from '@/features/help';

import { ModalView } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';

import { MGraphFlow } from './mgraph-flow';

export interface DlgShowTypeGraphProps {
  items: TypeInfo[];
}

export function DlgShowTypeGraph() {
  const tx = useTx();
  const { items } = useDialogsStore(state => state.props as DlgShowTypeGraphProps);
  const hideDialog = useDialogsStore(state => state.hideDialog);
  const graph = (() => {
    const result = new TypificationGraph();
    for (const item of items) {
      result.addElement(item.alias, item.type);
    }
    return result;
  })();

  if (graph.nodes.length === 0) {
    toast.error(tx('tx.typeGraph.fromExpression.fail'));
    hideDialog();
    return null;
  }

  return (
    <ModalView
      header={tx('tx.typeGraph')}
      className='cc-mask-sides flex flex-col justify-stretch w-[calc(100dvw-3rem)] h-[calc(100dvh-3rem)]'
      fullScreen
      helpTopic={HelpTopic.UI_TYPE_GRAPH}
    >
      <ReactFlowProvider>
        <MGraphFlow data={graph} />
      </ReactFlowProvider>
    </ModalView>
  );
}
