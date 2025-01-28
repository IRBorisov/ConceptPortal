'use client';

import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { TabList, TabPanel, Tabs } from 'react-tabs';

import { IInlineSynthesisDTO } from '@/backend/rsform/api';
import { useRSForm } from '@/backend/rsform/useRSForm';
import Modal from '@/components/ui/Modal';
import TabLabel from '@/components/ui/TabLabel';
import { LibraryItemID } from '@/models/library';
import { ICstSubstitute } from '@/models/oss';
import { ConstituentaID, IRSForm } from '@/models/rsform';
import { useDialogsStore } from '@/stores/dialogs';

import TabConstituents from './TabConstituents';
import TabSchema from './TabSchema';
import TabSubstitutions from './TabSubstitutions';

export interface DlgInlineSynthesisProps {
  receiver: IRSForm;
  onInlineSynthesis: (data: IInlineSynthesisDTO) => void;
}

export enum TabID {
  SCHEMA = 0,
  SELECTIONS = 1,
  SUBSTITUTIONS = 2
}

function DlgInlineSynthesis() {
  const { receiver, onInlineSynthesis } = useDialogsStore(state => state.props as DlgInlineSynthesisProps);
  const [activeTab, setActiveTab] = useState(TabID.SCHEMA);

  const [donorID, setDonorID] = useState<LibraryItemID | undefined>(undefined);
  const [selected, setSelected] = useState<ConstituentaID[]>([]);
  const [substitutions, setSubstitutions] = useState<ICstSubstitute[]>([]);

  const source = useRSForm({ itemID: donorID });

  const validated = !!source.schema && selected.length > 0;

  function handleSubmit() {
    if (!source.schema) {
      return;
    }
    onInlineSynthesis({
      source: source.schema.id,
      receiver: receiver.id,
      items: selected,
      substitutions: substitutions
    });
  }

  useEffect(() => {
    setSelected(source.schema ? source.schema.items.map(cst => cst.id) : []);
    setSubstitutions([]);
  }, [source.schema]);

  return (
    <Modal
      header='Импорт концептуальной схем'
      submitText='Добавить конституенты'
      className='w-[40rem] h-[33rem] px-6'
      canSubmit={validated}
      onSubmit={handleSubmit}
    >
      <Tabs
        selectedTabClassName='clr-selected'
        className='flex flex-col'
        selectedIndex={activeTab}
        onSelect={setActiveTab}
      >
        <TabList className={clsx('mb-3 self-center', 'flex', 'border divide-x rounded-none', 'bg-prim-200')}>
          <TabLabel label='Схема' title='Источник конституент' className='w-[8rem]' />
          <TabLabel label='Содержание' title='Перечень конституент' className='w-[8rem]' />
          <TabLabel label='Отождествления' title='Таблица отождествлений' className='w-[8rem]' />
        </TabList>

        <TabPanel>
          <TabSchema selected={donorID} setSelected={setDonorID} receiver={receiver} />
        </TabPanel>

        <TabPanel>
          <TabConstituents
            schema={source.schema}
            loading={source.isLoading}
            selected={selected}
            setSelected={setSelected}
          />
        </TabPanel>

        <TabPanel>
          <TabSubstitutions
            receiver={receiver}
            source={source.schema}
            selected={selected}
            loading={source.isLoading}
            substitutions={substitutions}
            setSubstitutions={setSubstitutions}
          />
        </TabPanel>
      </Tabs>
    </Modal>
  );
}

export default DlgInlineSynthesis;
