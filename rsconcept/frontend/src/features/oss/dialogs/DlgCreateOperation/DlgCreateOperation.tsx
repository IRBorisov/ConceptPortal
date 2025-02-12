'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import { useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';

import { ModalForm } from '@/components/Modal';
import { TabLabel, TabList, TabPanel, Tabs } from '@/components/Tabs';
import { HelpTopic } from '@/features/help';
import { useDialogsStore } from '@/stores/dialogs';

import { IOperationCreateDTO, IOperationPosition, schemaOperationCreate } from '../../backend/types';
import { useOperationCreate } from '../../backend/useOperationCreate';
import { describeOperationType, labelOperationType } from '../../labels';
import { IOperationSchema, OperationID, OperationType } from '../../models/oss';
import { calculateInsertPosition } from '../../models/ossAPI';
import TabInputOperation from './TabInputOperation';
import TabSynthesisOperation from './TabSynthesisOperation';

export interface DlgCreateOperationProps {
  oss: IOperationSchema;
  positions: IOperationPosition[];
  initialInputs: OperationID[];
  defaultX: number;
  defaultY: number;
  onCreate?: (newID: OperationID) => void;
}

export enum TabID {
  INPUT = 0,
  SYNTHESIS = 1
}

function DlgCreateOperation() {
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
    const target = calculateInsertPosition(oss, data.item_data.operation_type, data.arguments, positions, {
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

export default DlgCreateOperation;
