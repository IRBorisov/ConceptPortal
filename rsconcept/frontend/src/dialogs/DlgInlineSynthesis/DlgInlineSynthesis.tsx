'use client';

import clsx from 'clsx';
import { useMemo, useState } from 'react';
import { TabList, TabPanel, Tabs } from 'react-tabs';

import Modal, { ModalProps } from '@/components/ui/Modal';
import TabLabel from '@/components/ui/TabLabel';
import useRSFormDetails from '@/hooks/useRSFormDetails';
import { LibraryItemID } from '@/models/library';
import { ICstSubstituteData, IRSForm, IRSFormInlineData } from '@/models/rsform';

import ConstituentsTab from './ConstituentsTab';
import SchemaTab from './SchemaTab';
import SubstitutionsTab from './SubstitutionsTab';

interface DlgInlineSynthesisProps extends Pick<ModalProps, 'hideWindow'> {
  receiver: IRSForm;
  onInlineSynthesis: (data: IRSFormInlineData) => void;
}

export enum TabID {
  SCHEMA = 0,
  SELECTIONS = 1,
  SUBSTITUTIONS = 2
}

function DlgInlineSynthesis({ hideWindow, receiver, onInlineSynthesis }: DlgInlineSynthesisProps) {
  const [activeTab, setActiveTab] = useState(TabID.SCHEMA);

  const [donorID, setDonorID] = useState<LibraryItemID | undefined>(undefined);
  const [selected, setSelected] = useState<LibraryItemID[]>([]);
  const [substitutions, setSubstitutions] = useState<ICstSubstituteData[]>([]);

  const source = useRSFormDetails({ target: donorID ? String(donorID) : undefined });

  const validated = useMemo(() => false, []);

  function handleSubmit() {
    if (!source.schema) {
      return;
    }
    const data: IRSFormInlineData = {
      source: source.schema?.id,
      receiver: receiver.id,
      items: selected,
      substitutions: substitutions
    };
    onInlineSynthesis(data);
  }

  return (
    <Modal
      header='Импорт концептуальной схем'
      submitText='Добавить конституенты'
      className='w-[35rem] h-[30rem] px-6'
      hideWindow={hideWindow}
      canSubmit={validated}
      onSubmit={handleSubmit}
    >
      <Tabs
        forceRenderTabPanel
        selectedTabClassName='clr-selected'
        className='flex flex-col'
        selectedIndex={activeTab}
        onSelect={setActiveTab}
      >
        <TabList className={clsx('mb-3 self-center', 'flex', 'border divide-x rounded-none')}>
          <TabLabel label='Схема' title='Выбор импортируемой схемы' className='w-[8rem]' />
          <TabLabel label='Содержание' title='Выбор переносимого содержания' className='w-[8rem]' />
          <TabLabel label='Отождествления' title='Отождествление добавляемый конституент' className='w-[8rem]' />
        </TabList>

        <TabPanel style={{ display: activeTab === TabID.SCHEMA ? '' : 'none' }}>
          <SchemaTab selected={donorID} setSelected={setDonorID} />
        </TabPanel>

        <TabPanel style={{ display: activeTab === TabID.SELECTIONS ? '' : 'none' }}>
          <ConstituentsTab
            schema={source.schema}
            loading={source.loading}
            selected={selected}
            setSelected={setSelected}
          />
        </TabPanel>

        <TabPanel style={{ display: activeTab === TabID.SUBSTITUTIONS ? '' : 'none' }}>
          <SubstitutionsTab
            receiver={receiver}
            source={source.schema}
            loading={source.loading}
            substitutions={substitutions}
            setSubstitutions={setSubstitutions}
          />
        </TabPanel>
      </Tabs>
    </Modal>
  );
}

export default DlgInlineSynthesis;
