'use client';

import clsx from 'clsx';
import { useMemo, useState } from 'react';
import { TabList, TabPanel, Tabs } from 'react-tabs';

import BadgeHelp from '@/components/info/BadgeHelp';
import Modal from '@/components/ui/Modal';
import Overlay from '@/components/ui/Overlay';
import TabLabel from '@/components/ui/TabLabel';
import { ReferenceType } from '@/models/language';
import { HelpTopic } from '@/models/miscellaneous';
import { IRSForm } from '@/models/rsform';
import { PARAMETER } from '@/utils/constants';
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

  const handleSubmit = () => onSave(reference);

  const entityPanel = useMemo(
    () => (
      <TabPanel>
        <TabEntityReference initial={initial} schema={schema} setReference={setReference} setIsValid={setIsValid} />
      </TabPanel>
    ),
    [initial, schema]
  );

  const syntacticPanel = useMemo(
    () => (
      <TabPanel>
        <TabSyntacticReference initial={initial} setReference={setReference} setIsValid={setIsValid} />
      </TabPanel>
    ),
    [initial]
  );

  return (
    <Modal
      header='Редактирование ссылки'
      submitText='Сохранить ссылку'
      hideWindow={hideWindow}
      canSubmit={isValid}
      onSubmit={handleSubmit}
      className='w-[40rem] px-6 min-h-[35rem]'
    >
      <Overlay position='top-0 right-0'>
        <BadgeHelp
          topic={HelpTopic.TERM_CONTROL}
          className={clsx(PARAMETER.TOOLTIP_WIDTH, 'sm:max-w-[40rem]')}
          offset={14}
        />
      </Overlay>

      <Tabs
        selectedTabClassName='clr-selected'
        className='flex flex-col'
        selectedIndex={activeTab}
        onSelect={setActiveTab}
      >
        <TabList className={clsx('mb-3 self-center', 'flex', 'border divide-x rounded-none')}>
          <TabLabel title='Отсылка на термин в заданной словоформе' label={labelReferenceType(ReferenceType.ENTITY)} />
          <TabLabel
            title='Установление синтаксической связи с отсылкой на термин'
            label={labelReferenceType(ReferenceType.SYNTACTIC)}
          />
        </TabList>

        {entityPanel}
        {syntacticPanel}
      </Tabs>
    </Modal>
  );
}

export default DlgEditReference;
