'use client';

import clsx from 'clsx';
import { useLayoutEffect, useMemo, useState } from 'react';
import { TabList, TabPanel, Tabs } from 'react-tabs';

import BadgeHelp from '@/components/info/BadgeHelp';
import Modal from '@/components/ui/Modal';
import Overlay from '@/components/ui/Overlay';
import TabLabel from '@/components/ui/TabLabel';
import { useLibrary } from '@/context/LibraryContext';
import { LibraryItemID } from '@/models/library';
import { HelpTopic } from '@/models/miscellaneous';
import { IOperationCreateData, IOperationSchema, OperationID, OperationType } from '@/models/oss';
import { PARAMETER } from '@/utils/constants';
import { describeOperationType, labelOperationType } from '@/utils/labels';

import TabInputOperation from './TabInputOperation';
import TabSynthesisOperation from './TabSynthesisOperation';

interface DlgCreateOperationProps {
  hideWindow: () => void;
  oss: IOperationSchema;
  onCreate: (data: IOperationCreateData) => void;
}

export enum TabID {
  INPUT = 0,
  SYNTHESIS = 1
}

function DlgCreateOperation({ hideWindow, oss, onCreate }: DlgCreateOperationProps) {
  const library = useLibrary();
  const [activeTab, setActiveTab] = useState(TabID.INPUT);

  const [alias, setAlias] = useState('');
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [inputs, setInputs] = useState<OperationID[]>([]);
  const [attachedID, setAttachedID] = useState<LibraryItemID | undefined>(undefined);
  const [syncText, setSyncText] = useState(true);
  const [createSchema, setCreateSchema] = useState(false);

  const isValid = useMemo(
    () => (alias !== '' && activeTab === TabID.INPUT) || inputs.length != 1,
    [alias, activeTab, inputs]
  );

  useLayoutEffect(() => {
    if (attachedID) {
      const schema = library.items.find(value => value.id === attachedID);
      if (schema) {
        setAlias(schema.alias);
        setTitle(schema.title);
        setComment(schema.comment);
      }
    }
  }, [attachedID, library]);

  const handleSubmit = () => {
    const data: IOperationCreateData = {
      item_data: {
        position_x: 0,
        position_y: 0,
        alias: alias,
        title: title,
        comment: comment,
        sync_text: activeTab === TabID.INPUT ? syncText : true,
        operation_type: activeTab === TabID.INPUT ? OperationType.INPUT : OperationType.SYNTHESIS,
        result: activeTab === TabID.INPUT ? attachedID ?? null : null
      },
      positions: [],
      arguments: activeTab === TabID.INPUT ? undefined : inputs.length > 0 ? inputs : undefined,
      create_schema: createSchema
    };
    onCreate(data);
  };

  const inputPanel = useMemo(
    () => (
      <TabPanel>
        <TabInputOperation
          oss={oss}
          alias={alias}
          setAlias={setAlias}
          comment={comment}
          setComment={setComment}
          title={title}
          setTitle={setTitle}
          attachedID={attachedID}
          setAttachedID={setAttachedID}
          syncText={syncText}
          setSyncText={setSyncText}
          createSchema={createSchema}
          setCreateSchema={setCreateSchema}
        />
      </TabPanel>
    ),
    [alias, comment, title, attachedID, syncText, oss, createSchema]
  );

  const synthesisPanel = useMemo(
    () => (
      <TabPanel>
        <TabSynthesisOperation
          oss={oss}
          alias={alias}
          setAlias={setAlias}
          comment={comment}
          setComment={setComment}
          title={title}
          setTitle={setTitle}
          inputs={inputs}
          setInputs={setInputs}
        />
      </TabPanel>
    ),
    [oss, alias, comment, title, inputs]
  );

  return (
    <Modal
      header='Создание операции'
      submitText='Создать'
      hideWindow={hideWindow}
      canSubmit={isValid}
      onSubmit={handleSubmit}
      className='w-[40rem] px-6 min-h-[35rem]'
    >
      <Overlay position='top-0 right-0'>
        <BadgeHelp topic={HelpTopic.CC_OSS} className={clsx(PARAMETER.TOOLTIP_WIDTH, 'sm:max-w-[40rem]')} offset={14} />
      </Overlay>

      <Tabs
        selectedTabClassName='clr-selected'
        className='flex flex-col'
        selectedIndex={activeTab}
        onSelect={setActiveTab}
      >
        <TabList className={clsx('mb-3 self-center', 'flex', 'border divide-x rounded-none')}>
          <TabLabel
            title={describeOperationType(OperationType.INPUT)}
            label={labelOperationType(OperationType.INPUT)}
          />
          <TabLabel
            title={describeOperationType(OperationType.SYNTHESIS)}
            label={labelOperationType(OperationType.SYNTHESIS)}
          />
        </TabList>

        {inputPanel}
        {synthesisPanel}
      </Tabs>
    </Modal>
  );
}

export default DlgCreateOperation;
