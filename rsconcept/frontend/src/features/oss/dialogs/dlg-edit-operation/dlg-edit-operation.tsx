'use client';

import { Suspense, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { HelpTopic } from '@/features/help';

import { Loader } from '@/components/loader1';
import { ModalForm } from '@/components/modal1';
import { TabLabel, TabList, TabPanel, Tabs } from '@/components/tabs1';
import { useDialogsStore } from '@/stores/dialogs';

import {
  type IOperationPosition,
  type IOperationUpdateDTO,
  OperationType,
  schemaOperationUpdate
} from '../../backend/types';
import { useOperationUpdate } from '../../backend/use-operation-update';
import { type IOperation, type IOperationSchema } from '../../models/oss';

import { TabArguments } from './tab-arguments';
import { TabOperation } from './tab-operation';
import { TabSynthesis } from './tab-synthesis';

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

export function DlgEditOperation() {
  const { oss, target, positions } = useDialogsStore(state => state.props as DlgEditOperationProps);
  const { operationUpdate } = useOperationUpdate();

  const methods = useForm<IOperationUpdateDTO>({
    resolver: zodResolver(schemaOperationUpdate),
    defaultValues: {
      target: target.id,
      item_data: {
        alias: target.alias,
        title: target.title,
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
      className='w-160 px-6 h-128'
      helpTopic={HelpTopic.UI_SUBSTITUTIONS}
      hideHelpWhen={() => activeTab !== TabID.SUBSTITUTION}
    >
      <Tabs selectedTabClassName='clr-selected' className='grid' selectedIndex={activeTab} onSelect={setActiveTab}>
        <TabList className='mb-3 mx-auto w-fit flex border divide-x rounded-none bg-prim-200'>
          <TabLabel title='Текстовые поля' label='Карточка' className='w-32' />
          {target.operation_type === OperationType.SYNTHESIS ? (
            <TabLabel title='Выбор аргументов операции' label='Аргументы' className='w-32' />
          ) : null}
          {target.operation_type === OperationType.SYNTHESIS ? (
            <TabLabel titleHtml='Таблица отождествлений' label='Отождествления' className='w-32' />
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
