'use client';

import { useState } from 'react';
import { TabList, TabPanel, Tabs } from 'react-tabs';

import ConceptTab from '@/components/Common/ConceptTab';
import Modal from '@/components/Common/Modal';
import Overlay from '@/components/Common/Overlay';
import HelpButton from '@/components/Help/HelpButton';
import { ReferenceType } from '@/models/language';
import { HelpTopic } from '@/models/miscelanious';
import { IConstituenta } from '@/models/rsform';
import { labelReferenceType } from '@/utils/labels';

import EntityTab from './EntityTab';
import SyntacticTab from './SyntacticTab';

export interface IReferenceInputState {
  type: ReferenceType
  refRaw?: string
  text?: string
  mainRefs: string[]
  basePosition: number
}

interface DlgEditReferenceProps {
  hideWindow: () => void
  items: IConstituenta[]
  initial: IReferenceInputState
  onSave: (newRef: string) => void
}

export enum TabID {
  ENTITY = 0,
  SYNTACTIC = 1
}

function DlgEditReference({ hideWindow, items, initial, onSave }: DlgEditReferenceProps) {
  const [activeTab, setActiveTab] = useState(initial.type === ReferenceType.ENTITY ? TabID.ENTITY : TabID.SYNTACTIC);

  const [reference, setReference] = useState('');
  const [isValid, setIsValid] = useState(false);
  
  const handleSubmit = () => onSave(reference);
  
  return (
  <Modal
    title='Редактирование ссылки'
    submitText='Сохранить ссылку'
    hideWindow={hideWindow}
    canSubmit={isValid}
    onSubmit={handleSubmit}
    className='items-center min-w-[40rem] max-w-[40rem] px-6 min-h-[34rem]'
  >
  <Tabs defaultFocus
    selectedTabClassName='clr-selected'
    selectedIndex={activeTab}
    onSelect={setActiveTab}
  >
    <Overlay position='top-0 right-[4rem]'>
      <HelpButton topic={HelpTopic.TERM_CONTROL} dimensions='max-w-[35rem]' offset={14} />
    </Overlay>

    <TabList className='flex justify-center mb-3'>
      <div className='flex border w-fit'>
        <ConceptTab
          label={labelReferenceType(ReferenceType.ENTITY)}
          tooltip='Отсылка на термин в заданной словоформе'
          className='w-[12rem] border-r-2'
        />
        <ConceptTab
          label={labelReferenceType(ReferenceType.SYNTACTIC)}
          tooltip='Установление синтаксической связи с отсылкой на термин'
          className='w-[12rem]'
        />
      </div>
    </TabList>
    
    <div className='w-full'>
      <TabPanel>
      <EntityTab
        initial={initial}
        items={items}
        setReference={setReference}
        setIsValid={setIsValid}
      />
      </TabPanel>

      <TabPanel>
      <SyntacticTab 
        initial={initial}
        setReference={setReference}
        setIsValid={setIsValid}
      />
      </TabPanel>
    </div>
  </Tabs>
  </Modal>);
}

export default DlgEditReference;