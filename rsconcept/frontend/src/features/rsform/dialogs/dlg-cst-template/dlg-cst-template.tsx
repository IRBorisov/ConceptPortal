'use client';

import { Suspense, useState } from 'react';
import { useForm, useStore } from '@tanstack/react-form';

import { useTx } from '@/i18n';
import { CstType, type RSForm } from '@rsconcept/domain/library';
import { generateAlias, validateNewAlias } from '@rsconcept/domain/library/rsform-api';

import { HelpTopic } from '@/features/help';

import { Loader } from '@/components/loader';
import { ModalForm } from '@/components/modal';
import { TabLabel, TabList, TabPanel, Tabs } from '@/components/tabs';
import { type CreateFieldProps, type FieldStateData } from '@/utils/forms';
import { withPreventDefault } from '@/utils/utils';

import {
  type CreateConstituentaDTO,
  type CreateConstituentsBatchDTO,
  schemaCreateConstituenta
} from '../../backend/types';
import { buildTemplateConstituentsBatch, getTemplateMainDuplicateAlias } from '../../utils/build-template-batch';
import { FormCreateCst, type FormCreateCstFields } from '../dlg-create-cst/form-create-cst';
import { useRsformDialogsStore } from '../rsform-dialog-store';

import { TabArguments } from './tab-arguments';
import { TabTemplate } from './tab-template';
import { type TemplateSelection } from './template-context';
import { TemplateState } from './template-state';

export interface DlgCstTemplateProps {
  schema: RSForm;
  onCreate: (data: CreateConstituentsBatchDTO) => void;
  insertAfter?: number;
}

const TabID = {
  TEMPLATE: 0,
  ARGUMENTS: 1,
  CONSTITUENTA: 2
} as const;
type TabID = (typeof TabID)[keyof typeof TabID];

const emptySelection: TemplateSelection = {
  prototype: null,
  args: [],
  templateItems: []
};

export function DlgCstTemplate() {
  const tx = useTx();
  const { schema, onCreate, insertAfter } = useRsformDialogsStore(state => state.props as DlgCstTemplateProps);
  const [selection, setSelection] = useState<TemplateSelection>(emptySelection);

  const defaultValues: CreateConstituentaDTO = {
    insert_after: insertAfter ?? null,
    crucial: false,
    cst_type: CstType.TERM,
    alias: '',
    convention: '',
    definition_formal: '',
    definition_raw: '',
    term_raw: '',
    term_forms: [],
    value_is_property: false,
    typification_manual: ''
  };

  const form = useForm({
    defaultValues,
    validators: {
      onChange: schemaCreateConstituenta
    }
  });

  const values = useStore(form.store, state => state.values);
  const alias = values.alias;
  const cst_type = values.cst_type;

  const mainDuplicateAlias = getTemplateMainDuplicateAlias(
    schema,
    selection.templateItems,
    selection.prototype,
    selection.args,
    values
  );

  function getSubmitState(): { canSubmit: boolean; hint: string } {
    if (!selection.prototype || !cst_type) {
      return { canSubmit: false, hint: tx('tx.cst.template.validate') };
    }
    if (mainDuplicateAlias) {
      return {
        canSubmit: false,
        hint: tx('tx.lib.defineFormal.validate.duplicate', { aliases: mainDuplicateAlias })
      };
    }
    if (!validateNewAlias(alias, cst_type, schema)) {
      return { canSubmit: false, hint: tx('tx.cst.alias.validate') };
    }
    if (!schemaCreateConstituenta.safeParse(values).success) {
      return { canSubmit: false, hint: tx('tx.general.form.invalid') };
    }
    return { canSubmit: true, hint: '' };
  }

  const { canSubmit, hint } = getSubmitState();

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

  function handleSubmit() {
    if (!getSubmitState().canSubmit || !selection.prototype) {
      return;
    }
    onCreate(
      buildTemplateConstituentsBatch(schema, selection.templateItems, selection.prototype, selection.args, values)
    );
  }

  return (
    <ModalForm
      header={tx('tx.cst.template.instantiate')}
      submitText={tx('tx.general.create')}
      className='w-172 h-140 px-6'
      canSubmit={canSubmit}
      onSubmit={withPreventDefault(handleSubmit)}
      validationHint={hint}
      helpTopic={HelpTopic.RSL_TEMPLATES}
    >
      <Tabs className='grid' selectedIndex={activeTab} onSelect={index => setActiveTab(index as TabID)}>
        <TabList className='mb-3 mx-auto flex border divide-x rounded-none'>
          <TabLabel label={tx('tx.cst.template.short')} title={tx('tx.cst.template.select')} />
          <TabLabel label={tx('tx.cst.template.argument.plural')} title={tx('tx.cst.template.argument.replace')} />
          <TabLabel label={tx('tx.general.role.editor')} title={tx('tx.cst.edit')} />
        </TabList>

        <Suspense fallback={<Loader />}>
          <TemplateState
            onDefinitionFormalChange={handleDefinitionFormalChange}
            onCstTypeChange={handleTemplateCstTypeChange}
            onAliasChange={handleAliasChange}
            onTermRawChange={handleTermRawChange}
            onDefinitionRawChange={handleDefinitionRawChange}
            onSelectionChange={setSelection}
          >
            <TabPanel>
              <TabTemplate schema={schema} />
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
        </Suspense>
      </Tabs>
    </ModalForm>
  );
}
