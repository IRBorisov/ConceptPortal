'use client';

import { useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { HelpTopic } from '@/features/help';

import { ModalForm } from '@/components/modal';
import { TabLabel, TabList, TabPanel, Tabs } from '@/components/tabs';
import { useDialogsStore } from '@/stores/dialogs';

import { type ICreateOperationDTO, OperationType, schemaCreateOperation } from '../../backend/types';
import { useCreateOperation } from '../../backend/use-create-operation';
import { describeOperationType, labelOperationType } from '../../labels';
import { type LayoutManager } from '../../models/oss-layout-api';

import { TabInputOperation } from './tab-input-operation';
import { TabSynthesisOperation } from './tab-synthesis-operation';

export interface DlgCreateOperationProps {
  manager: LayoutManager;
  initialParent: number | null;
  initialInputs: number[];
  defaultX: number;
  defaultY: number;
  onCreate?: (newID: number) => void;
}

export const TabID = {
  INPUT: 0,
  SYNTHESIS: 1
} as const;
export type TabID = (typeof TabID)[keyof typeof TabID];

export function DlgCreateOperation() {
  const { createOperation } = useCreateOperation();

  const { manager, initialInputs, initialParent, onCreate, defaultX, defaultY } = useDialogsStore(
    state => state.props as DlgCreateOperationProps
  );

  const methods = useForm<ICreateOperationDTO>({
    resolver: zodResolver(schemaCreateOperation),
    defaultValues: {
      item_data: {
        operation_type: initialInputs.length === 0 ? OperationType.INPUT : OperationType.SYNTHESIS,
        alias: '',
        title: '',
        description: '',
        result: null,
        parent: initialParent
      },
      position_x: defaultX,
      position_y: defaultY,
      arguments: initialInputs,
      create_schema: false,
      layout: manager.layout
    },
    mode: 'onChange'
  });
  const alias = useWatch({ control: methods.control, name: 'item_data.alias' });
  const [activeTab, setActiveTab] = useState(initialInputs.length === 0 ? TabID.INPUT : TabID.SYNTHESIS);
  const isValid = !!alias && !manager.oss.operations.some(operation => operation.alias === alias);

  function onSubmit(data: ICreateOperationDTO) {
    const target = manager.calculateNewOperationPosition(data);
    data.position_x = target.x;
    data.position_y = target.y;
    void createOperation({ itemID: manager.oss.id, data: data }).then(response =>
      onCreate?.(response.new_operation.id)
    );
  }

  function handleSelectTab(newTab: TabID, last: TabID) {
    if (last === newTab) {
      return;
    }
    if (newTab === TabID.INPUT) {
      methods.setValue('item_data.operation_type', OperationType.INPUT);
      methods.setValue('item_data.result', null);
      methods.setValue('arguments', []);
    } else {
      methods.setValue('item_data.operation_type', OperationType.SYNTHESIS);
      methods.setValue('arguments', initialInputs);
    }
    setActiveTab(newTab);
  }

  return (
    <ModalForm
      header='Создание операции'
      submitText='Создать'
      canSubmit={isValid}
      onSubmit={event => void methods.handleSubmit(onSubmit)(event)}
      className='w-180 px-6 h-128'
      helpTopic={HelpTopic.CC_OSS}
    >
      <Tabs
        selectedTabClassName='cc-selected'
        className='grid'
        selectedIndex={activeTab}
        onSelect={(index, last) => handleSelectTab(index as TabID, last as TabID)}
      >
        <TabList className='z-pop mx-auto -mb-5 flex border divide-x rounded-none bg-secondary'>
          <TabLabel
            title={describeOperationType(OperationType.INPUT)}
            label={labelOperationType(OperationType.INPUT)}
          />
          <TabLabel
            title={describeOperationType(OperationType.SYNTHESIS)}
            label={labelOperationType(OperationType.SYNTHESIS)}
          />
        </TabList>
        <FormProvider {...methods}>
          <TabPanel>
            <TabInputOperation />
          </TabPanel>

          <TabPanel>
            <TabSynthesisOperation />
          </TabPanel>
        </FormProvider>
      </Tabs>
    </ModalForm>
  );
}
