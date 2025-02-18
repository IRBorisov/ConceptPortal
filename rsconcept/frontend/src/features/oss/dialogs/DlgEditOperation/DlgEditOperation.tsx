'use client';

import { Suspense, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';

import { HelpTopic } from '@/features/help';

import { Loader } from '@/components/Loader';
import { ModalForm } from '@/components/Modal';
import { TabLabel, TabList, TabPanel, Tabs } from '@/components/Tabs';
import { useDialogsStore } from '@/stores/dialogs';

import { IOperationPosition, IOperationUpdateDTO, OperationType, schemaOperationUpdate } from '../../backend/types';
import { useOperationUpdate } from '../../backend/useOperationUpdate';
import { IOperation, IOperationSchema } from '../../models/oss';

import TabArguments from './TabArguments';
import TabOperation from './TabOperation';
import TabSynthesis from './TabSynthesis';

export interface DlgEditOperationProps {
  oss: IOperationSchema;
  target: IOperation;
  positions: IOperationPosition[];
}

export enum TabID {
  CARD = 0,
  ARGUMENTS = 1,
  SUBSTITUTION = 2
}

function DlgEditOperation() {
  const { oss, target, positions } = useDialogsStore(state => state.props as DlgEditOperationProps);
  const { operationUpdate } = useOperationUpdate();

  const methods = useForm<IOperationUpdateDTO>({
    resolver: zodResolver(schemaOperationUpdate),
    defaultValues: {
      target: target.id,
      item_data: {
        alias: target.alias,
        title: target.alias,
        comment: target.comment
      },
      arguments: target.arguments,
      substitutions: target.substitutions.map(sub => ({
        original: sub.original,
        substitution: sub.substitution
      })),
      positions: positions
    },
    mode: 'onChange'
  });

  const [activeTab, setActiveTab] = useState(TabID.CARD);

  function onSubmit(data: IOperationUpdateDTO) {
    return operationUpdate({ itemID: oss.id, data });
  }

  return (
    <ModalForm
      header='Редактирование операции'
      submitText='Сохранить'
      canSubmit={methods.formState.isValid}
      onSubmit={event => void methods.handleSubmit(onSubmit)(event)}
      className='w-[40rem] px-6 h-[32rem]'
      helpTopic={HelpTopic.UI_SUBSTITUTIONS}
      hideHelpWhen={() => activeTab !== TabID.SUBSTITUTION}
    >
      <Tabs
        selectedTabClassName='clr-selected'
        className='flex flex-col'
        selectedIndex={activeTab}
        onSelect={setActiveTab}
      >
        <TabList className={clsx('mb-3 self-center', 'flex', 'border divide-x rounded-none', 'bg-prim-200')}>
          <TabLabel title='Текстовые поля' label='Карточка' className='w-[8rem]' />
          {target.operation_type === OperationType.SYNTHESIS ? (
            <TabLabel title='Выбор аргументов операции' label='Аргументы' className='w-[8rem]' />
          ) : null}
          {target.operation_type === OperationType.SYNTHESIS ? (
            <TabLabel titleHtml='Таблица отождествлений' label='Отождествления' className='w-[8rem]' />
          ) : null}
        </TabList>

        <FormProvider {...methods}>
          <TabPanel>
            <TabOperation />
          </TabPanel>

          {target.operation_type === OperationType.SYNTHESIS ? (
            <TabPanel>
              <TabArguments />
            </TabPanel>
          ) : null}
          {target.operation_type === OperationType.SYNTHESIS ? (
            <TabPanel>
              <Suspense fallback={<Loader />}>
                <TabSynthesis />
              </Suspense>
            </TabPanel>
          ) : null}
        </FormProvider>
      </Tabs>
    </ModalForm>
  );
}

export default DlgEditOperation;
