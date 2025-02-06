'use client';

import clsx from 'clsx';
import { Suspense, useEffect, useState } from 'react';
import { TabList, TabPanel, Tabs } from 'react-tabs';

import { IInlineSynthesisDTO } from '@/backend/rsform/api';
import { useRSForm } from '@/backend/rsform/useRSForm';
import Loader from '@/components/ui/Loader';
import { ModalForm } from '@/components/ui/Modal';
import TabLabel from '@/components/ui/TabLabel';
import { LibraryItemID } from '@/models/library';
import { ICstSubstitute } from '@/models/oss';
import { ConstituentaID, IRSForm } from '@/models/rsform';
import { useDialogsStore } from '@/stores/dialogs';

import TabConstituents from './TabConstituents';
import TabSource from './TabSource';
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

  const [sourceID, setSourceID] = useState<LibraryItemID | undefined>(undefined);
  const [selected, setSelected] = useState<ConstituentaID[]>([]);
  const [substitutions, setSubstitutions] = useState<ICstSubstitute[]>([]);

  const { schema } = useRSForm({ itemID: sourceID });

  const validated = selected.length > 0;

  function handleSubmit() {
    if (!sourceID || selected.length === 0) {
      return true;
    }
    onInlineSynthesis({
      source: sourceID,
      receiver: receiver.id,
      items: selected,
      substitutions: substitutions
    });
    return true;
  }

  useEffect(() => {
    if (schema) {
      setSelected(schema.items.map(cst => cst.id));
    }
  }, [schema, setSelected]);

  function handleSetSource(schemaID: LibraryItemID) {
    setSourceID(schemaID);
    setSelected([]);
    setSubstitutions([]);
  }

  return (
    <ModalForm
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
          <TabLabel
            label='Содержание'
            title={!sourceID ? 'Выберите схему' : 'Перечень конституент'}
            className='w-[8rem]'
            disabled={!sourceID}
          />
          <TabLabel
            label='Отождествления'
            title={!sourceID ? 'Выберите схему' : 'Таблица отождествлений'}
            className='w-[8rem]'
            disabled={!sourceID}
          />
        </TabList>

        <TabPanel>
          <TabSource selected={sourceID} setSelected={handleSetSource} receiver={receiver} />
        </TabPanel>

        <TabPanel>
          {!!sourceID ? (
            <Suspense fallback={<Loader />}>
              <TabConstituents itemID={sourceID} selected={selected} setSelected={setSelected} />
            </Suspense>
          ) : null}
        </TabPanel>

        <TabPanel>
          {!!sourceID ? (
            <Suspense fallback={<Loader />}>
              <TabSubstitutions
                sourceID={sourceID}
                receiver={receiver}
                selected={selected}
                substitutions={substitutions}
                setSubstitutions={setSubstitutions}
              />
            </Suspense>
          ) : null}
        </TabPanel>
      </Tabs>
    </ModalForm>
  );
}

export default DlgInlineSynthesis;
