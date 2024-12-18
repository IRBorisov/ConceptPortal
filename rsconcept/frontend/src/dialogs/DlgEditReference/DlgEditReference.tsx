'use client';

import clsx from 'clsx';
import { useState } from 'react';
import { TabList, TabPanel, Tabs } from 'react-tabs';

import Modal from '@/components/ui/Modal';
import TabLabel from '@/components/ui/TabLabel';
import { ReferenceType } from '@/models/language';
import { HelpTopic } from '@/models/miscellaneous';
import { IRSForm } from '@/models/rsform';
import { labelReferenceType } from '@/utils/labels';

import TabEntityReference from './TabEntityReference';
import TabSyntacticReference from './TabSyntacticReference';

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

  return (
    <Modal
      header='Редактирование ссылки'
      submitText='Сохранить ссылку'
      hideWindow={hideWindow}
      canSubmit={isValid}
      onSubmit={() => onSave(reference)}
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
          <TabEntityReference
            initial={initial}
            schema={schema}
            onChangeReference={setReference}
            onChangeValid={setIsValid}
          />
        </TabPanel>

        <TabPanel>
          <TabSyntacticReference initial={initial} onChangeReference={setReference} onChangeValid={setIsValid} />
        </TabPanel>
      </Tabs>
    </Modal>
  );
}

export default DlgEditReference;
