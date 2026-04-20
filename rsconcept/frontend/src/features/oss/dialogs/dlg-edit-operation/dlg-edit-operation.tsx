'use client';

import { Suspense, useMemo, useState } from 'react';
import { useForm, useStore } from '@tanstack/react-form';

import { OperationType, type OssLayout } from '@/domain/library';
import { LayoutManager } from '@/domain/library/oss-layout-api';
import { type Substitution } from '@/domain/library/rsform';

import { HelpTopic } from '@/features/help';

import { Loader } from '@/components/loader';
import { ModalForm } from '@/components/modal';
import { TabLabel, TabList, TabPanel, Tabs } from '@/components/tabs';
import { useDialogsStore } from '@/stores/dialogs';
import { type CreateFieldProps, type FieldStateData } from '@/utils/forms';
import { hintMsg } from '@/utils/labels';

import { schemaUpdateOperation, type UpdateOperationDTO } from '../../backend/types';
import { useOss } from '../../backend/use-oss';
import { useUpdateOperation } from '../../backend/use-update-operation';

import { TabArguments } from './tab-arguments';
import { type DlgEditOperationCardFields, TabOperation } from './tab-operation';
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

  const { schema } = useOss({ itemID: ossID });
  const manager = new LayoutManager(schema, layout);
  const target = manager.oss.operationByID.get(targetID)!;

  const form = useForm({
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
    } satisfies UpdateOperationDTO,
    validators: {
      onChange: schemaUpdateOperation
    },
    onSubmit: async ({ value }) => {
      const data = { ...value };
      if (data.item_data.parent !== target.parent) {
        manager.onChangeParent(target.nodeID, data.item_data.parent === null ? null : `b${data.item_data.parent}`);
        data.layout = manager.layout;
      }
      await updateOperation({ itemID: manager.oss.id, data });
    }
  });

  const values = useStore(form.store, state => state.values as UpdateOperationDTO);
  const canSubmit = useMemo(() => schemaUpdateOperation.safeParse(values).success, [values]);

  const [activeTab, setActiveTab] = useState<TabID>(TabID.CARD);

  function TitleField({ children }: CreateFieldProps<string>) {
    return <form.Field name='item_data.title'>{field => children(field as FieldStateData<string>)}</form.Field>;
  }

  function AliasField({ children }: CreateFieldProps<string>) {
    return <form.Field name='item_data.alias'>{field => children(field as FieldStateData<string>)}</form.Field>;
  }

  function ParentField({ children }: CreateFieldProps<number | null>) {
    return <form.Field name='item_data.parent'>{field => children(field as FieldStateData<number | null>)}</form.Field>;
  }

  function DescriptionField({ children }: CreateFieldProps<string>) {
    return <form.Field name='item_data.description'>{field => children(field as FieldStateData<string>)}</form.Field>;
  }

  const cardFields: DlgEditOperationCardFields = {
    TitleField,
    AliasField,
    ParentField,
    DescriptionField
  };

  function handleArgumentsChange(newValue: number[]) {
    form.setFieldValue('arguments', newValue);
  }

  function handleResetSubstitutions() {
    form.setFieldValue('substitutions', []);
  }

  function handleSubstitutionsChange(newValue: Substitution[]) {
    form.setFieldValue('substitutions', newValue);
  }

  return (
    <ModalForm
      header='Редактирование операции'
      submitText='Сохранить'
      canSubmit={canSubmit}
      validationHint={canSubmit ? '' : hintMsg.formInvalid}
      onSubmit={event => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
      className='w-160 px-6 h-128'
      helpTopic={HelpTopic.UI_SUBSTITUTIONS}
      hideHelpWhen={() => activeTab !== TabID.SUBSTITUTIONS}
    >
      <Tabs className='grid' selectedIndex={activeTab} onSelect={index => setActiveTab(index as TabID)}>
        <TabList className='mb-3 mx-auto w-fit flex border divide-x rounded-none'>
          <TabLabel title='Текстовые поля' label='Паспорт' />
          <TabLabel
            title='Выбор аргументов операции'
            label='Аргументы'
            disabled={target.operation_type !== OperationType.SYNTHESIS}
          />
          <TabLabel
            titleHtml='Таблица отождествлений'
            label='Отождествления'
            disabled={target.operation_type !== OperationType.SYNTHESIS}
          />
        </TabList>

        <TabPanel>
          <TabOperation oss={schema} fields={cardFields} />
        </TabPanel>

        <TabPanel>
          {target.operation_type === OperationType.SYNTHESIS ? (
            <TabArguments
              oss={schema}
              target={target}
              args={values.arguments}
              onChangeArguments={handleArgumentsChange}
              onResetSubstitutions={handleResetSubstitutions}
            />
          ) : null}
        </TabPanel>

        <TabPanel>
          {target.operation_type === OperationType.SYNTHESIS ? (
            <Suspense fallback={<Loader />}>
              <TabSubstitutions
                oss={schema}
                inputs={values.arguments}
                substitutions={values.substitutions}
                onChangeSubstitutions={handleSubstitutionsChange}
              />
            </Suspense>
          ) : null}
        </TabPanel>
      </Tabs>
    </ModalForm>
  );
}
