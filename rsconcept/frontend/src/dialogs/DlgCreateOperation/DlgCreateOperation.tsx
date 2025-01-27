'use client';

import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { TabList, TabPanel, Tabs } from 'react-tabs';

import { useLibrary } from '@/backend/library/useLibrary';
import { IOperationCreateDTO } from '@/backend/oss/api';
import Modal from '@/components/ui/Modal';
import TabLabel from '@/components/ui/TabLabel';
import { LibraryItemID } from '@/models/library';
import { HelpTopic } from '@/models/miscellaneous';
import { IOperationSchema, OperationID, OperationType } from '@/models/oss';
import { useDialogsStore } from '@/stores/dialogs';
import { describeOperationType, labelOperationType } from '@/utils/labels';

import TabInputOperation from './TabInputOperation';
import TabSynthesisOperation from './TabSynthesisOperation';

export interface DlgCreateOperationProps {
  oss: IOperationSchema;
  onCreate: (data: IOperationCreateDTO) => void;
  initialInputs: OperationID[];
}

export enum TabID {
  INPUT = 0,
  SYNTHESIS = 1
}

function DlgCreateOperation() {
  const { items: libraryItems } = useLibrary();

  const { oss, onCreate, initialInputs } = useDialogsStore(state => state.props as DlgCreateOperationProps);
  const [activeTab, setActiveTab] = useState(initialInputs.length > 0 ? TabID.SYNTHESIS : TabID.INPUT);

  const [alias, setAlias] = useState('');
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [inputs, setInputs] = useState<OperationID[]>(initialInputs);
  const [attachedID, setAttachedID] = useState<LibraryItemID | undefined>(undefined);
  const [createSchema, setCreateSchema] = useState(false);

  const isValid = (() => {
    if (alias === '') {
      return false;
    }
    if (activeTab === TabID.SYNTHESIS && inputs.length === 0) {
      return false;
    }
    if (activeTab === TabID.INPUT && !attachedID) {
      if (oss.items.some(operation => operation.alias === alias)) {
        return false;
      }
    }
    return true;
  })();

  useEffect(() => {
    if (attachedID) {
      const schema = libraryItems.find(value => value.id === attachedID);
      if (schema) {
        setAlias(schema.alias);
        setTitle(schema.title);
        setComment(schema.comment);
      }
    }
  }, [attachedID, libraryItems]);

  const handleSubmit = () => {
    onCreate({
      item_data: {
        position_x: 0,
        position_y: 0,
        alias: alias,
        title: title,
        comment: comment,
        operation_type: activeTab === TabID.INPUT ? OperationType.INPUT : OperationType.SYNTHESIS,
        result: activeTab === TabID.INPUT ? attachedID ?? null : null
      },
      positions: [],
      arguments: activeTab === TabID.INPUT ? undefined : inputs.length > 0 ? inputs : undefined,
      create_schema: createSchema
    });
  };

  function handleSelectTab(newTab: TabID, last: TabID) {
    if (last === newTab) {
      return;
    }
    if (newTab === TabID.INPUT) {
      setAttachedID(undefined);
    } else {
      setInputs(initialInputs);
    }
    setActiveTab(newTab);
  }

  return (
    <Modal
      header='Создание операции'
      submitText='Создать'
      canSubmit={isValid}
      onSubmit={handleSubmit}
      className='w-[40rem] px-6 h-[32rem]'
      helpTopic={HelpTopic.CC_OSS}
    >
      <Tabs
        selectedTabClassName='clr-selected'
        className='flex flex-col pt-2'
        selectedIndex={activeTab}
        onSelect={handleSelectTab}
      >
        <TabList
          className={clsx('self-center absolute top-[2.4rem]', 'flex', 'border divide-x rounded-none', 'bg-prim-200')}
        >
          <TabLabel
            title={describeOperationType(OperationType.INPUT)}
            label={labelOperationType(OperationType.INPUT)}
          />
          <TabLabel
            title={describeOperationType(OperationType.SYNTHESIS)}
            label={labelOperationType(OperationType.SYNTHESIS)}
          />
        </TabList>

        <TabPanel>
          <TabInputOperation
            oss={oss}
            alias={alias}
            onChangeAlias={setAlias}
            comment={comment}
            onChangeComment={setComment}
            title={title}
            onChangeTitle={setTitle}
            attachedID={attachedID}
            onChangeAttachedID={setAttachedID}
            createSchema={createSchema}
            onChangeCreateSchema={setCreateSchema}
          />
        </TabPanel>

        <TabPanel>
          <TabSynthesisOperation
            oss={oss}
            alias={alias}
            onChangeAlias={setAlias}
            comment={comment}
            onChangeComment={setComment}
            title={title}
            onChangeTitle={setTitle}
            inputs={inputs}
            setInputs={setInputs}
          />
        </TabPanel>
      </Tabs>
    </Modal>
  );
}

export default DlgCreateOperation;
