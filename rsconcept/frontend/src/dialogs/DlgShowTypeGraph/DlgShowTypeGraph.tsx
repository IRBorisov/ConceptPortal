'use client';

import { useMemo } from 'react';
import { toast } from 'react-toastify';
import { ReactFlowProvider } from 'reactflow';

import Modal, { ModalProps } from '@/components/ui/Modal';
import { HelpTopic } from '@/models/miscellaneous';
import { ITypeInfo } from '@/models/rslang';
import { TMGraph } from '@/models/TMGraph';
import { errors } from '@/utils/labels';

import MGraphFlow from './MGraphFlow';

interface DlgShowTypeGraphProps extends Pick<ModalProps, 'hideWindow'> {
  items: ITypeInfo[];
}

function DlgShowTypeGraph({ hideWindow, items }: DlgShowTypeGraphProps) {
  const graph = useMemo(() => {
    const result = new TMGraph();
    items.forEach(item => result.addConstituenta(item.alias, item.result, item.args));
    return result;
  }, [items]);

  if (graph.nodes.length === 0) {
    toast.error(errors.typeStructureFailed);
    hideWindow();
    return null;
  }

  return (
    <Modal
      header='Граф ступеней'
      readonly
      hideWindow={hideWindow}
      className='flex flex-col justify-stretch w-[calc(100dvw-3rem)] h-[calc(100dvh-6rem)]'
      helpTopic={HelpTopic.UI_TYPE_GRAPH}
    >
      <ReactFlowProvider>
        <MGraphFlow data={graph} />
      </ReactFlowProvider>
    </Modal>
  );
}

export default DlgShowTypeGraph;
