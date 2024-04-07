'use client';

import clsx from 'clsx';
import { useState } from 'react';
import { TabList, TabPanel, Tabs } from 'react-tabs';

import BadgeHelp from '@/components/man/BadgeHelp';
import Modal from '@/components/ui/Modal';
import Overlay from '@/components/ui/Overlay';
import TabLabel from '@/components/ui/TabLabel';
import { ReferenceType } from '@/models/language';
import { HelpTopic } from '@/models/miscellaneous';
import { IRSForm } from '@/models/rsform';
import { labelReferenceType } from '@/utils/labels';

import EntityTab from './EntityTab';
import SyntacticTab from './SyntacticTab';

export interface IReferenceInputState {
  type: ReferenceType;
  refRaw?: string;
  text?: string;
  mainRefs: string[];
  basePosition: number;
}

interface DlgEditReferenceProps {
  hideWindow: () => void;
  schema: IRSForm;
  initial: IReferenceInputState;
  onSave: (newRef: string) => void;
}

export enum TabID {
  ENTITY = 0,
  SYNTACTIC = 1
}

function DlgEditReference({ hideWindow, schema, initial, onSave }: DlgEditReferenceProps) {
  const [activeTab, setActiveTab] = useState(initial.type === ReferenceType.ENTITY ? TabID.ENTITY : TabID.SYNTACTIC);

  const [reference, setReference] = useState('');
  const [isValid, setIsValid] = useState(false);

  const handleSubmit = () => onSave(reference);

  return (
    <Modal
      header='Редактирование ссылки'
      submitText='Сохранить ссылку'
      hideWindow={hideWindow}
      canSubmit={isValid}
      onSubmit={handleSubmit}
      className='w-[40rem] px-6 min-h-[34rem]'
    >
      <Overlay position='top-0 right-[4rem]'>
        <BadgeHelp topic={HelpTopic.TERM_CONTROL} className='max-w-[35rem]' offset={14} />
      </Overlay>

      <Tabs
        selectedTabClassName='clr-selected'
        className='flex flex-col'
        selectedIndex={activeTab}
        onSelect={setActiveTab}
      >
        <TabList className={clsx('mb-3 self-center', 'flex', 'border divide-x rounded-none')}>
          <TabLabel
            title='Отсылка на термин в заданной словоформе'
            label={labelReferenceType(ReferenceType.ENTITY)}
            className='w-[12rem]'
          />
          <TabLabel
            title='Установление синтаксической связи с отсылкой на термин'
            label={labelReferenceType(ReferenceType.SYNTACTIC)}
            className='w-[12rem]'
          />
        </TabList>

        <TabPanel>
          <EntityTab initial={initial} schema={schema} setReference={setReference} setIsValid={setIsValid} />
        </TabPanel>

        <TabPanel>
          <SyntacticTab initial={initial} setReference={setReference} setIsValid={setIsValid} />
        </TabPanel>
      </Tabs>
    </Modal>
  );
}

export default DlgEditReference;
