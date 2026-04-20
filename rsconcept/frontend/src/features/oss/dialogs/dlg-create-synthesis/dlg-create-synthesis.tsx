'use client';

import { Suspense, useMemo, useState } from 'react';
import { useForm, useStore } from '@tanstack/react-form';

import { type OssLayout } from '@/domain/library';
import { LayoutManager, OPERATION_NODE_HEIGHT, OPERATION_NODE_WIDTH } from '@/domain/library/oss-layout-api';
import { type Substitution } from '@/domain/library/rsform';

import { HelpTopic } from '@/features/help';

import { Loader } from '@/components/loader';
import { ModalForm } from '@/components/modal';
import { TabLabel, TabList, TabPanel, Tabs } from '@/components/tabs';
import { useDialogsStore } from '@/stores/dialogs';
import { type CreateFieldProps, type FieldStateData } from '@/utils/forms';
import { hintMsg } from '@/utils/labels';

import { type CreateSynthesisDTO, schemaCreateSynthesis } from '../../backend/types';
import { useCreateSynthesis } from '../../backend/use-create-synthesis';
import { useOss } from '../../backend/use-oss';

import { TabArguments } from './tab-arguments';
import { TabSubstitutions } from './tab-substitutions';

export interface DlgCreateSynthesisProps {
  ossID: number;
  layout: OssLayout;
  initialParent: number | null;
  initialInputs: number[];
  defaultX: number;
  defaultY: number;
  onCreate?: (newID: number) => void;
}

export const TabID = {
  ARGUMENTS: 0,
  SUBSTITUTIONS: 1
} as const;
export type TabID = (typeof TabID)[keyof typeof TabID];

export function DlgCreateSynthesis() {
  const { createSynthesis } = useCreateSynthesis();

  const { ossID, layout, initialInputs, initialParent, onCreate, defaultX, defaultY } = useDialogsStore(
    state => state.props as DlgCreateSynthesisProps
  );
  const { schema } = useOss({ itemID: ossID });
  const manager = new LayoutManager(schema, layout);

  const form = useForm({
    defaultValues: {
      item_data: {
        alias: '',
        title: '',
        description: '',
        parent: initialParent
      },
      position: {
        x: defaultX,
        y: defaultY,
        width: OPERATION_NODE_WIDTH,
        height: OPERATION_NODE_HEIGHT
      },
      arguments: initialInputs,
      substitutions: [] as Substitution[],
      layout: manager.layout
    } satisfies CreateSynthesisDTO,
    validators: {
      onChange: schemaCreateSynthesis
    },
    onSubmit: ({ value }) => {
      const data = { ...value };
      data.position = manager.newOperationPosition(data.position, data.item_data.parent, data.arguments);
      data.layout = manager.layout;
      void createSynthesis({ itemID: manager.oss.id, data }).then(response => onCreate?.(response.new_operation));
    }
  });

  const values = useStore(form.store, state => state.values);
  const alias = values.item_data.alias;
  const [activeTab, setActiveTab] = useState<TabID>(TabID.ARGUMENTS);
  const { canSubmit, hint } = useMemo(() => {
    if (!alias) {
      return { canSubmit: false, hint: hintMsg.aliasEmpty };
    }
    if (manager.oss.operations.some(operation => operation.alias === alias)) {
      return { canSubmit: false, hint: hintMsg.schemaAliasTaken };
    }
    if (!schemaCreateSynthesis.safeParse(values).success) {
      return { canSubmit: false, hint: hintMsg.formInvalid };
    }
    return { canSubmit: true, hint: '' };
  }, [alias, values, manager.oss.operations]);

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

  function ArgumentsField({ children }: CreateFieldProps<number[]>) {
    return <form.Field name='arguments'>{field => children(field as FieldStateData<number[]>)}</form.Field>;
  }

  function SubstitutionsField({ children }: CreateFieldProps<Substitution[]>) {
    return <form.Field name='substitutions'>{field => children(field as FieldStateData<Substitution[]>)}</form.Field>;
  }

  return (
    <ModalForm
      header='Создание операции синтеза'
      submitText='Создать'
      canSubmit={canSubmit}
      validationHint={hint}
      onSubmit={event => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
      className='w-180 px-6 h-128'
      helpTopic={HelpTopic.CC_OSS}
    >
      <Tabs className='grid' selectedIndex={activeTab} onSelect={index => setActiveTab(index as TabID)}>
        <TabList className='z-pop mx-auto flex border divide-x rounded-none'>
          <TabLabel title='Выбор аргументов операции' label='Аргументы' />
          <TabLabel titleHtml='Таблица отождествлений' label='Отождествления' />
        </TabList>
        <TabPanel>
          <TabArguments
            oss={schema}
            inputs={values.arguments}
            fields={{ TitleField, AliasField, ParentField, DescriptionField, ArgumentsField }}
          />
        </TabPanel>
        <TabPanel>
          <Suspense fallback={<Loader />}>
            <TabSubstitutions
              oss={schema}
              inputs={values.arguments}
              substitutions={values.substitutions}
              fields={{ SubstitutionsField }}
            />
          </Suspense>
        </TabPanel>
      </Tabs>
    </ModalForm>
  );
}
