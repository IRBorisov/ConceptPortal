'use client';

import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { TabList, TabPanel, Tabs } from 'react-tabs';

import Modal, { ModalProps } from '@/components/ui/Modal';
import TabLabel from '@/components/ui/TabLabel';
import useRSFormDetails from '@/hooks/useRSFormDetails';
import { LibraryItemID } from '@/models/library';
import { ICstSubstitute } from '@/models/oss';
import { ConstituentaID, IInlineSynthesisData, IRSForm } from '@/models/rsform';

import TabConstituents from './TabConstituents';
import TabSchema from './TabSchema';
import TabSubstitutions from './TabSubstitutions';

interface DlgInlineSynthesisProps extends Pick<ModalProps, 'hideWindow'> {
  receiver: IRSForm;
  onInlineSynthesis: (data: IInlineSynthesisData) => void;
}

export enum TabID {
  SCHEMA = 0,
  SELECTIONS = 1,
  SUBSTITUTIONS = 2
}

function DlgInlineSynthesis({ hideWindow, receiver, onInlineSynthesis }: DlgInlineSynthesisProps) {
  const [activeTab, setActiveTab] = useState(TabID.SCHEMA);

  const [donorID, setDonorID] = useState<LibraryItemID | undefined>(undefined);
  const [selected, setSelected] = useState<ConstituentaID[]>([]);
  const [substitutions, setSubstitutions] = useState<ICstSubstitute[]>([]);

  const source = useRSFormDetails({ target: donorID ? String(donorID) : undefined });

  const validated = !!source.schema && selected.length > 0;

  function handleSubmit() {
    if (!source.schema) {
      return;
    }
    const data: IInlineSynthesisData = {
      source: source.schema?.id,
      receiver: receiver.id,
      items: selected,
      substitutions: substitutions
    };
    onInlineSynthesis(data);
  }

  useEffect(() => {
    setSelected(source.schema ? source.schema?.items.map(cst => cst.id) : []);
    setSubstitutions([]);
  }, [source.schema]);

  return (
    <Modal
      header='Импорт концептуальной схем'
      submitText='Добавить конституенты'
      className='w-[40rem] h-[33rem] px-6'
      hideWindow={hideWindow}
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
            loading={source.loading}
            selected={selected}
            setSelected={setSelected}
          />
        </TabPanel>

        <TabPanel>
          <TabSubstitutions
            receiver={receiver}
            source={source.schema}
            selected={selected}
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
