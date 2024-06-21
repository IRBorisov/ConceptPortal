'use client';

import clsx from 'clsx';
import { useMemo, useState } from 'react';
import { TabList, TabPanel, Tabs } from 'react-tabs';
import { toast } from 'react-toastify';

import Modal, { ModalProps } from '@/components/ui/Modal.tsx';
import TabLabel from '@/components/ui/TabLabel.tsx';
import SchemaTab from '@/dialogs/DlgInlineSynthesis/SchemaTab.tsx';
import { LibraryItemID } from '@/models/library.ts';
import { ISubstitution } from '@/models/rsform.ts';
import { useSynthesis } from '@/pages/OssPage/SynthesisContext.tsx';

interface DlgCreateSynthesisProps extends Pick<ModalProps, 'hideWindow'> {
  nodeId: string;
}

export enum SynthesisTabID {
  SCHEMA = 0,
  SUBSTITUTIONS = 1
}

function DlgSelectInputScheme({ nodeId, hideWindow }: DlgCreateSynthesisProps) {
  const controller = useSynthesis();

  const [activeTab, setActiveTab] = useState(SynthesisTabID.SCHEMA);
  const [selected, setSelected] = useState<LibraryItemID[]>([]);
  const [substitutions, setSubstitutions] = useState<ISubstitution[]>([]);
  const [donorID, setDonorID] = useState<LibraryItemID | undefined>(undefined);

  const schemaPanel = useMemo(
    () => (
      <TabPanel>
        <SchemaTab selected={donorID} setSelected={setDonorID} />
      </TabPanel>
    ),
    [donorID]
  );

  function handleSubmit() {
    if (donorID !== undefined) {
      controller.updateBounds(nodeId, donorID);
    }
  }

  function validate() {
    if (donorID === undefined) {
      toast.error('Выберите источник конституент');
      return false;
    }
    return true;
  }

  return (
    <Modal
      header='Синтез концептуальных схем'
      hideWindow={hideWindow}
      submitText='Привязать'
      className='w-[25rem] px-6'
      canSubmit={validate()}
      onSubmit={handleSubmit}
    >
      <Tabs
        selectedTabClassName='clr-selected'
        className='flex flex-col'
        selectedIndex={activeTab}
        onSelect={setActiveTab}
      >
        <TabList className={clsx('mb-3 self-center', 'flex', 'border divide-x rounded-none')}>
          <TabLabel label='Схема' title='Источник конституент' className='w-[8rem]' />
        </TabList>
        {schemaPanel}
      </Tabs>
    </Modal>
  );
}

export default DlgSelectInputScheme;
