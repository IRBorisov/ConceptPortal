'use client';

import { Suspense, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { HelpTopic } from '@/features/help';

import { Loader } from '@/components/loader';
import { ModalForm } from '@/components/modal';
import { TabLabel, TabList, TabPanel, Tabs } from '@/components/tabs';
import { useDialogsStore } from '@/stores/dialogs';
import { hintMsg } from '@/utils/labels';

import { OperationType, type OssLayout, schemaUpdateOperation, type UpdateOperationDTO } from '../../backend/types';
import { useOssSuspense } from '../../backend/use-oss';
import { useUpdateOperation } from '../../backend/use-update-operation';
import { LayoutManager } from '../../models/oss-layout-api';

import { TabArguments } from './tab-arguments';
import { TabOperation } from './tab-operation';
import { TabSubstitutions } from './tab-substitutions';

export interface DlgEditOperationProps {
  ossID: number;
  layout: OssLayout;
  targetID: number;
}

export const TabID = {
  CARD: 0,
  ARGUMENTS: 1,
  SUBSTITUTIONS: 2
} as const;
export type TabID = (typeof TabID)[keyof typeof TabID];

export function DlgEditOperation() {
  const { ossID, layout, targetID } = useDialogsStore(state => state.props as DlgEditOperationProps);
  const { updateOperation } = useUpdateOperation();

  const { schema } = useOssSuspense({ itemID: ossID });
  const manager = new LayoutManager(schema, layout);
  const target = manager.oss.operationByID.get(targetID)!;

  const methods = useForm<UpdateOperationDTO>({
    resolver: zodResolver(schemaUpdateOperation),
    defaultValues: {
      target: targetID,
      item_data: {
        alias: target.alias,
        title: target.title,
        description: target.description,
        parent: target.parent
      },
      arguments: target.operation_type === OperationType.SYNTHESIS ? target.arguments : [],
      substitutions:
        target.operation_type === OperationType.SYNTHESIS
          ? target.substitutions.map(sub => ({
            original: sub.original,
            substitution: sub.substitution
          }))
          : [],
      layout: manager.layout
    },
    mode: 'onChange'
  });
  const [activeTab, setActiveTab] = useState<TabID>(TabID.CARD);
  const canSubmit = methods.formState.isValid;

  function onSubmit(data: UpdateOperationDTO) {
    if (data.item_data.parent !== target.parent) {
      manager.onChangeParent(target.nodeID, data.item_data.parent === null ? null : `b${data.item_data.parent}`);
      data.layout = manager.layout;
    }
    return updateOperation({ itemID: manager.oss.id, data });
  }

  return (
    <ModalForm
      header='Редактирование операции'
      submitText='Сохранить'
      canSubmit={canSubmit}
      validationHint={canSubmit ? '' : hintMsg.formInvalid}
      onSubmit={event => void methods.handleSubmit(onSubmit)(event)}
      className='w-160 px-6 h-128'
      helpTopic={HelpTopic.UI_SUBSTITUTIONS}
      hideHelpWhen={() => activeTab !== TabID.SUBSTITUTIONS}
    >
      <Tabs className='grid' selectedIndex={activeTab} onSelect={index => setActiveTab(index as TabID)}>
        <TabList className='mb-3 mx-auto w-fit flex border divide-x rounded-none'>
          <TabLabel
            title='Текстовые поля' //
            label='Паспорт'
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
            <TabOperation oss={schema} />
          </TabPanel>

          <TabPanel>
            {target.operation_type === OperationType.SYNTHESIS ? <TabArguments oss={schema} target={target} /> : null}
          </TabPanel>

          <TabPanel>
            {target.operation_type === OperationType.SYNTHESIS ? (
              <Suspense fallback={<Loader />}>
                <TabSubstitutions oss={schema} />
              </Suspense>
            ) : null}
          </TabPanel>
        </FormProvider>
      </Tabs>
    </ModalForm>
  );
}
