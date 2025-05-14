'use client';

import { Suspense, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { HelpTopic } from '@/features/help';

import { Loader } from '@/components/loader';
import { ModalForm } from '@/components/modal';
import { TabLabel, TabList, TabPanel, Tabs } from '@/components/tabs';
import { useDialogsStore } from '@/stores/dialogs';

import { type IUpdateOperationDTO, OperationType, schemaUpdateOperation } from '../../backend/types';
import { useUpdateOperation } from '../../backend/use-update-operation';
import { type IOperation } from '../../models/oss';
import { type LayoutManager } from '../../models/oss-layout-api';

import { TabArguments } from './tab-arguments';
import { TabOperation } from './tab-operation';
import { TabSynthesis } from './tab-synthesis';

export interface DlgEditOperationProps {
  manager: LayoutManager;
  target: IOperation;
}

export const TabID = {
  CARD: 0,
  ARGUMENTS: 1,
  SUBSTITUTION: 2
} as const;
export type TabID = (typeof TabID)[keyof typeof TabID];

export function DlgEditOperation() {
  const { manager, target } = useDialogsStore(state => state.props as DlgEditOperationProps);
  const { updateOperation } = useUpdateOperation();

  const methods = useForm<IUpdateOperationDTO>({
    resolver: zodResolver(schemaUpdateOperation),
    defaultValues: {
      target: target.id,
      item_data: {
        alias: target.alias,
        title: target.title,
        description: target.description,
        parent: target.parent
      },
      arguments: target.arguments,
      substitutions: target.substitutions.map(sub => ({
        original: sub.original,
        substitution: sub.substitution
      })),
      layout: manager.layout
    },
    mode: 'onChange'
  });
  const [activeTab, setActiveTab] = useState<TabID>(TabID.CARD);

  function onSubmit(data: IUpdateOperationDTO) {
    if (data.item_data.parent !== target.parent) {
      manager.onOperationChangeParent(data.target, data.item_data.parent);
    }
    return updateOperation({ itemID: manager.oss.id, data });
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
      <Tabs
        selectedTabClassName='cc-selected'
        className='grid'
        selectedIndex={activeTab}
        onSelect={index => setActiveTab(index as TabID)}
      >
        <TabList className='mb-3 mx-auto w-fit flex border divide-x rounded-none bg-secondary'>
          <TabLabel
            title='Текстовые поля' //
            label='Карточка'
            className='w-32'
          />
          <TabLabel
            title='Выбор аргументов операции'
            label='Аргументы'
            className='w-32'
            disabled={target.operation_type !== OperationType.SYNTHESIS}
          />
          <TabLabel
            titleHtml='Таблица отождествлений'
            label='Отождествления'
            className='w-32'
            disabled={target.operation_type !== OperationType.SYNTHESIS}
          />
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
