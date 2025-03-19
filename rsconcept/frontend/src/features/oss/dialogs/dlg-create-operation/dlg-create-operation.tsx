'use client';

import { useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { HelpTopic } from '@/features/help';

import { ModalForm } from '@/components/modal';
import { TabLabel, TabList, TabPanel, Tabs } from '@/components/tabs';
import { useDialogsStore } from '@/stores/dialogs';

import {
  type IOperationCreateDTO,
  type IOperationPosition,
  OperationType,
  schemaOperationCreate
} from '../../backend/types';
import { useOperationCreate } from '../../backend/use-operation-create';
import { describeOperationType, labelOperationType } from '../../labels';
import { type IOperationSchema } from '../../models/oss';
import { calculateInsertPosition } from '../../models/oss-api';

import { TabInputOperation } from './tab-input-operation';
import { TabSynthesisOperation } from './tab-synthesis-operation';

export interface DlgCreateOperationProps {
  oss: IOperationSchema;
  positions: IOperationPosition[];
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
  const { operationCreate } = useOperationCreate();

  const { oss, positions, initialInputs, onCreate, defaultX, defaultY } = useDialogsStore(
    state => state.props as DlgCreateOperationProps
  );

  const methods = useForm<IOperationCreateDTO>({
    resolver: zodResolver(schemaOperationCreate),
    defaultValues: {
      item_data: {
        operation_type: initialInputs.length === 0 ? OperationType.INPUT : OperationType.SYNTHESIS,
        result: null,
        position_x: defaultX,
        position_y: defaultY,
        alias: '',
        title: '',
        comment: ''
      },
      arguments: initialInputs,
      create_schema: false,
      positions: positions
    },
    mode: 'onChange'
  });
  const alias = useWatch({ control: methods.control, name: 'item_data.alias' });
  const [activeTab, setActiveTab] = useState(initialInputs.length === 0 ? TabID.INPUT : TabID.SYNTHESIS);
  const isValid = !!alias && !oss.items.some(operation => operation.alias === alias);

  function onSubmit(data: IOperationCreateDTO) {
    const target = calculateInsertPosition(oss, data.arguments, positions, {
      x: defaultX,
      y: defaultY
    });
    data.item_data.position_x = target.x;
    data.item_data.position_y = target.y;
    void operationCreate({ itemID: oss.id, data: data }).then(response => onCreate?.(response.new_operation.id));
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
      className='w-160 px-6 h-128'
      helpTopic={HelpTopic.CC_OSS}
    >
      <Tabs
        selectedTabClassName='clr-selected'
        className='grid'
        selectedIndex={activeTab}
        onSelect={(index, last) => handleSelectTab(index as TabID, last as TabID)}
      >
        <TabList className='z-pop mx-auto -mb-5 flex border divide-x rounded-none bg-prim-200'>
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
