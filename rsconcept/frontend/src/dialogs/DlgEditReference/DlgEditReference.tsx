import { useState } from 'react';
import { TabList, TabPanel, Tabs } from 'react-tabs';

import ConceptTab from '../../components/Common/ConceptTab';
import ConceptTooltip from '../../components/Common/ConceptTooltip';
import Modal from '../../components/Common/Modal';
import HelpTerminologyControl from '../../components/Help/HelpTerminologyControl';
import { HelpIcon } from '../../components/Icons';
import { ReferenceType } from '../../models/language';
import { IConstituenta } from '../../models/rsform';
import { labelReferenceType } from '../../utils/labels';
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
  >
  <div className='min-w-[40rem] max-w-[40rem] flex flex-col gap-3 mb-2 min-h-[34rem]'>
  <Tabs defaultFocus
    className='flex flex-col items-center'
    selectedTabClassName='clr-selected'
    selectedIndex={activeTab}
    onSelect={setActiveTab}
  >
    <div className='flex gap-1 pl-6 mb-3'>
      <TabList className='flex border'>
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
      </TabList>

      <div id='terminology-help' className='px-1 py-1'>
        <HelpIcon color='text-primary' size={5} />
      </div>
      <ConceptTooltip
        anchorSelect='#terminology-help'
        className='max-w-[30rem] z-modal-tooltip'
        offset={10}
      >
        <HelpTerminologyControl />
      </ConceptTooltip>
    </div>
    
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
  </div>
  </Modal>);
}

export default DlgEditReference;
