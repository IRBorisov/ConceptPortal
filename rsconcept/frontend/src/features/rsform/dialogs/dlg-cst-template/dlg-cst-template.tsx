'use client';

import { Suspense, useState } from 'react';
import { useForm, useStore } from '@tanstack/react-form';

import { type CstType, type RSForm } from '@/domain/library';
import { generateAlias, validateNewAlias } from '@/domain/library/rsform-api';

import { HelpTopic } from '@/features/help';

import { Loader } from '@/components/loader';
import { ModalForm } from '@/components/modal';
import { TabLabel, TabList, TabPanel, Tabs } from '@/components/tabs';
import { useDialogsStore } from '@/stores/dialogs';
import { type CreateFieldProps, type FieldStateData } from '@/utils/forms';
import { hintMsg } from '@/utils/labels';
import { withPreventDefault } from '@/utils/utils';

import { type CreateConstituentaDTO, schemaCreateConstituenta } from '../../backend/types';
import { FormCreateCst, type FormCreateCstFields } from '../dlg-create-cst/form-create-cst';

import { TabArguments } from './tab-arguments';
import { TabTemplate } from './tab-template';
import { TemplateState } from './template-state';

export interface DlgCstTemplateProps {
  schema: RSForm;
  onCreate: (data: CreateConstituentaDTO) => void;
  insertAfter?: number;
}

const TabID = {
  TEMPLATE: 0,
  ARGUMENTS: 1,
  CONSTITUENTA: 2
} as const;
type TabID = (typeof TabID)[keyof typeof TabID];

export function DlgCstTemplate() {
  const { schema, onCreate, insertAfter } = useDialogsStore(state => state.props as DlgCstTemplateProps);

  const form = useForm({
    defaultValues: {
      insert_after: insertAfter ?? null,
      crucial: false,
      cst_type: undefined,
      alias: '',
      convention: '',
      definition_formal: '',
      definition_raw: '',
      term_raw: '',
      term_forms: []
    } as unknown as CreateConstituentaDTO,
    validators: {
      onChange: schemaCreateConstituenta
    },
    onSubmit: ({ value }) => onCreate(value)
  });

  const values = useStore(form.store, state => state.values);
  const alias = values.alias;
  const cst_type = values.cst_type;
  const { canSubmit, hint } = (() => {
    if (!cst_type) {
      return { canSubmit: false, hint: hintMsg.templateInvalid };
    }
    if (!validateNewAlias(alias, cst_type, schema)) {
      return { canSubmit: false, hint: hintMsg.aliasInvalid };
    }
    if (!schemaCreateConstituenta.safeParse(values).success) {
      return { canSubmit: false, hint: hintMsg.formInvalid };
    }
    return { canSubmit: true, hint: '' };
  })();

  const [activeTab, setActiveTab] = useState<TabID>(TabID.TEMPLATE);

  function AliasField({ children }: CreateFieldProps<string>) {
    return <form.Field name='alias'>{field => children(field as FieldStateData<string>)}</form.Field>;
  }

  function TermRawField({ children }: CreateFieldProps<string>) {
    return <form.Field name='term_raw'>{field => children(field as FieldStateData<string>)}</form.Field>;
  }

  function DefinitionFormalField({ children }: CreateFieldProps<string>) {
    return <form.Field name='definition_formal'>{field => children(field as FieldStateData<string>)}</form.Field>;
  }

  function DefinitionRawField({ children }: CreateFieldProps<string>) {
    return <form.Field name='definition_raw'>{field => children(field as FieldStateData<string>)}</form.Field>;
  }

  function ConventionField({ children }: CreateFieldProps<string>) {
    return <form.Field name='convention'>{field => children(field as FieldStateData<string>)}</form.Field>;
  }

  const cstFields: FormCreateCstFields = {
    AliasField,
    TermRawField,
    DefinitionFormalField,
    DefinitionRawField,
    ConventionField
  };

  function handleChangeCstType(target: CstType) {
    form.setFieldValue('cst_type', target);
    form.setFieldValue('alias', generateAlias(target, schema));
  }

  function handleToggleCrucial() {
    form.setFieldValue('crucial', !values.crucial);
  }

  function handleDefinitionFormalChange(newValue: string) {
    form.setFieldValue('definition_formal', newValue);
  }

  function handleTemplateCstTypeChange(newValue: CstType) {
    form.setFieldValue('cst_type', newValue);
  }

  function handleAliasChange(newValue: string) {
    form.setFieldValue('alias', newValue);
  }

  function handleTermRawChange(newValue: string) {
    form.setFieldValue('term_raw', newValue);
  }

  function handleDefinitionRawChange(newValue: string) {
    form.setFieldValue('definition_raw', newValue);
  }

  return (
    <ModalForm
      header='Создание конституенты из шаблона'
      submitText='Создать'
      className='w-172 h-140 px-6'
      canSubmit={canSubmit}
      onSubmit={withPreventDefault(() => void form.handleSubmit())}
      validationHint={hint}
      helpTopic={HelpTopic.RSL_TEMPLATES}
    >
      <Tabs className='grid' selectedIndex={activeTab} onSelect={index => setActiveTab(index as TabID)}>
        <TabList className='mb-3 mx-auto flex border divide-x rounded-none'>
          <TabLabel label='Шаблон' title='Выбор шаблона выражения' />
          <TabLabel label='Аргументы' title='Подстановка аргументов шаблона' />
          <TabLabel label='Редактор' title='Редактирование конституенты' />
        </TabList>

        <TemplateState
          onDefinitionFormalChange={handleDefinitionFormalChange}
          onCstTypeChange={handleTemplateCstTypeChange}
          onAliasChange={handleAliasChange}
          onTermRawChange={handleTermRawChange}
          onDefinitionRawChange={handleDefinitionRawChange}
        >
          <TabPanel>
            <Suspense fallback={<Loader />}>
              <TabTemplate schema={schema} />
            </Suspense>
          </TabPanel>

          <TabPanel>
            <TabArguments schema={schema} definition={values.definition_formal} />
          </TabPanel>

          <TabPanel>
            <div className='cc-fade-in cc-column'>
              <FormCreateCst
                schema={schema}
                values={values}
                fields={cstFields}
                onChangeCstType={handleChangeCstType}
                onToggleCrucial={handleToggleCrucial}
              />
            </div>
          </TabPanel>
        </TemplateState>
      </Tabs>
    </ModalForm>
  );
}
