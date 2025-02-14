'use client';

import { useState } from 'react';
import clsx from 'clsx';

import { HelpTopic } from '@/features/help';

import { ModalForm } from '@/components/Modal';
import { TabLabel, TabList, TabPanel, Tabs } from '@/components/Tabs';
import { useDialogsStore } from '@/stores/dialogs';

import { labelReferenceType } from '../../labels';
import { ReferenceType } from '../../models/language';
import { IRSForm } from '../../models/rsform';

import TabEntityReference from './TabEntityReference';
import TabSyntacticReference from './TabSyntacticReference';

export interface IReferenceInputState {
  type: ReferenceType;
  refRaw?: string;
  text?: string;
  mainRefs: string[];
  basePosition: number;
}

export interface DlgEditReferenceProps {
  schema: IRSForm;
  initial: IReferenceInputState;
  onSave: (newRef: string) => void;
}

export enum TabID {
  ENTITY = 0,
  SYNTACTIC = 1
}

function DlgEditReference() {
  const { initial, onSave } = useDialogsStore(state => state.props as DlgEditReferenceProps);
  const [activeTab, setActiveTab] = useState(initial.type === ReferenceType.ENTITY ? TabID.ENTITY : TabID.SYNTACTIC);
  const [reference, setReference] = useState('');
  const [isValid, setIsValid] = useState(false);

  function handleSubmit() {
    onSave(reference);
    return true;
  }

  return (
    <ModalForm
      header='Редактирование ссылки'
      submitText='Сохранить ссылку'
      canSubmit={isValid}
      onSubmit={handleSubmit}
      className='w-[40rem] px-6 h-[32rem]'
      helpTopic={HelpTopic.TERM_CONTROL}
    >
      <Tabs
        selectedTabClassName='clr-selected'
        className='flex flex-col'
        selectedIndex={activeTab}
        onSelect={setActiveTab}
      >
        <TabList className={clsx('mb-3 self-center', 'flex', 'border divide-x rounded-none', 'bg-prim-200')}>
          <TabLabel title='Отсылка на термин в заданной словоформе' label={labelReferenceType(ReferenceType.ENTITY)} />
          <TabLabel
            title='Установление синтаксической связи с отсылкой на термин'
            label={labelReferenceType(ReferenceType.SYNTACTIC)}
          />
        </TabList>

        <TabPanel>
          <TabEntityReference onChangeReference={setReference} onChangeValid={setIsValid} />
        </TabPanel>

        <TabPanel>
          <TabSyntacticReference onChangeReference={setReference} onChangeValid={setIsValid} />
        </TabPanel>
      </Tabs>
    </ModalForm>
  );
}

export default DlgEditReference;
