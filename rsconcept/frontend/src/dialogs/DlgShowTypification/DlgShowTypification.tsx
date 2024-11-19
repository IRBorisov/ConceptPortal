'use client';

import { useMemo } from 'react';
import { toast } from 'react-toastify';
import { ReactFlowProvider } from 'reactflow';

import Modal, { ModalProps } from '@/components/ui/Modal';
import { HelpTopic } from '@/models/miscellaneous';
import { IArgumentInfo } from '@/models/rslang';
import { TMGraph } from '@/models/TMGraph';
import { errors } from '@/utils/labels';

import MGraphFlow from './MGraphFlow';

interface DlgShowTypificationProps extends Pick<ModalProps, 'hideWindow'> {
  alias: string;
  resultTypification: string;
  args: IArgumentInfo[];
}

function DlgShowTypification({ hideWindow, alias, resultTypification, args }: DlgShowTypificationProps) {
  const graph = useMemo(() => {
    const result = new TMGraph();
    result.addConstituenta(alias, resultTypification, args);
    return result;
  }, [alias, resultTypification, args]);

  if (graph.nodes.length === 0) {
    toast.error(errors.typeStructureFailed);
    hideWindow();
    return null;
  }

  return (
    <Modal
      header='Структура типизации'
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

export default DlgShowTypification;
