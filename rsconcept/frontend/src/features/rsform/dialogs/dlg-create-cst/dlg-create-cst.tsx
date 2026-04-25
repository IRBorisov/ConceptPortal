'use client';

import { useMemo } from 'react';
import { useForm, useStore } from '@tanstack/react-form';

import { type CstType, type RSForm } from '@/domain/library';
import { generateAlias, validateNewAlias } from '@/domain/library/rsform-api';

import { ModalForm } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';
import { type CreateFieldProps, type FieldStateData } from '@/utils/forms';
import { hintMsg } from '@/utils/labels';
import { withPreventDefault } from '@/utils/utils';

import { type CreateConstituentaDTO, schemaCreateConstituenta } from '../../backend/types';

import { FormCreateCst, type FormCreateCstFields } from './form-create-cst';

export interface DlgCreateCstProps {
  initial: CreateConstituentaDTO;
  schema: RSForm;
  onCreate: (data: CreateConstituentaDTO) => void;
  onCancel?: () => void;
}

export function DlgCreateCst() {
  const { initial, schema, onCreate, onCancel } = useDialogsStore(state => state.props as DlgCreateCstProps);

  const form = useForm({
    defaultValues: { ...initial },
    validators: {
      onChange: schemaCreateConstituenta
    },
    onSubmit: ({ value }) => onCreate(value)
  });

  const values = useStore(form.store, state => state.values);
  const alias = values.alias;
  const cst_type = values.cst_type;
  const { canSubmit, hint } = useMemo(() => {
    if (!validateNewAlias(alias, cst_type, schema)) {
      return { canSubmit: false, hint: hintMsg.aliasInvalid };
    }
    if (!schemaCreateConstituenta.safeParse(values).success) {
      return { canSubmit: false, hint: hintMsg.formInvalid };
    }
    return { canSubmit: true, hint: '' };
  }, [alias, cst_type, schema, values]);

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

  return (
    <ModalForm
      header='Создание конституенты'
      canSubmit={canSubmit}
      onCancel={onCancel}
      onSubmit={withPreventDefault(() => void form.handleSubmit())}
      validationHint={hint}
      submitText='Создать'
      className='cc-column w-140 max-h-120 py-2 px-6'
    >
      <FormCreateCst
        schema={schema}
        values={values}
        fields={cstFields}
        onChangeCstType={handleChangeCstType}
        onToggleCrucial={handleToggleCrucial}
      />
    </ModalForm>
  );
}
