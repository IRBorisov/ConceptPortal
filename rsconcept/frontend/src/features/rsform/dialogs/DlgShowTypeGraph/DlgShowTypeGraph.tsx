'use client';

import { toast } from 'react-toastify';
import { ReactFlowProvider } from 'reactflow';

import { HelpTopic } from '@/features/help';

import { ModalView } from '@/components/Modal';
import { useDialogsStore } from '@/stores/dialogs';
import { errorMsg } from '@/utils/labels';

import { ITypeInfo } from '../../models/rslang';
import { TMGraph } from '../../models/TMGraph';

import { MGraphFlow } from './MGraphFlow';

export interface DlgShowTypeGraphProps {
  items: ITypeInfo[];
}

export function DlgShowTypeGraph() {
  const { items } = useDialogsStore(state => state.props as DlgShowTypeGraphProps);
  const hideDialog = useDialogsStore(state => state.hideDialog);
  const graph = (() => {
    const result = new TMGraph();
    items.forEach(item => result.addConstituenta(item.alias, item.result, item.args));
    return result;
  })();

  if (graph.nodes.length === 0) {
    toast.error(errorMsg.typeStructureFailed);
    hideDialog();
    return null;
  }

  return (
    <ModalView
      header='Граф ступеней'
      className='flex flex-col justify-stretch w-[calc(100dvw-3rem)] h-[calc(100dvh-6rem)]'
      helpTopic={HelpTopic.UI_TYPE_GRAPH}
    >
      <ReactFlowProvider>
        <MGraphFlow data={graph} />
      </ReactFlowProvider>
    </ModalView>
  );
}
