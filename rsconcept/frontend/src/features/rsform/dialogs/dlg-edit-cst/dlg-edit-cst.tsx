'use client';

import { useMemo } from 'react';
import { useForm, useStore } from '@tanstack/react-form';

import { useConceptNavigation } from '@/app';
import { useFindPredecessor } from '@/features/oss/backend/use-find-predecessor';

import { MiniButton } from '@/components/control';
import { IconChild, IconRSForm } from '@/components/icons';
import { ModalForm } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';
import { type CreateFieldProps, type FieldStateData } from '@/utils/forms';
import { hintMsg } from '@/utils/labels';

import { schemaUpdateConstituenta, type UpdateConstituentaDTO } from '../../backend/types';
import { useRSForm } from '../../backend/use-rsform';
import { useUpdateConstituenta } from '../../backend/use-update-constituenta';
import { type CstType } from '../../models/rsform';
import { generateAlias, validateNewAlias } from '../../models/rsform-api';

import { FormEditCst, type FormEditCstFields } from './form-edit-cst';

export interface DlgEditCstProps {
  schemaID: number;
  targetID: number;
}

export function DlgEditCst() {
  const { schemaID, targetID } = useDialogsStore(state => state.props as DlgEditCstProps);
  const { schema } = useRSForm({ itemID: schemaID });
  const target = schema.cstByID.get(targetID)!;
  const hideDialog = useDialogsStore(state => state.hideDialog);
  const { updateConstituenta } = useUpdateConstituenta();
  const router = useConceptNavigation();
  const { findPredecessor } = useFindPredecessor();

  const form = useForm({
    defaultValues: {
      target: target.id,
      item_data: {
        alias: target.alias,
        crucial: target.crucial,
        cst_type: target.cst_type,
        convention: target.convention,
        definition_formal: target.definition_formal,
        definition_raw: target.definition_raw,
        term_raw: target.term_raw,
        term_forms: target.term_forms
      }
    } as UpdateConstituentaDTO,
    validators: {
      onChange: schemaUpdateConstituenta
    },
    onSubmit: async ({ value }) => {
      await updateConstituenta({ itemID: schema.id, data: value });
    }
  });

  const values = useStore(form.store, state => state.values);
  const alias = values.item_data.alias!;
  const cst_type = values.item_data.cst_type!;
  const canSubmit = useMemo(() => {
    const parsed = schemaUpdateConstituenta.safeParse(values).success;
    return (
      (parsed && alias === target.alias && cst_type === target.cst_type) || validateNewAlias(alias, cst_type, schema)
    );
  }, [values, alias, cst_type, target.alias, target.cst_type, schema]);

  function navigateToTarget() {
    hideDialog();
    router.gotoEditActive(target.id);
  }

  function editSource() {
    hideDialog();
    void findPredecessor(target.id).then(reference =>
      router.gotoCstEdit(reference.schema, reference.id)
    );
  }

  function AliasField({ children }: CreateFieldProps<string>) {
    return <form.Field name='item_data.alias'>{field => children(field as FieldStateData<string>)}</form.Field>;
  }

  function TermRawField({ children }: CreateFieldProps<string>) {
    return <form.Field name='item_data.term_raw'>{field => children(field as FieldStateData<string>)}</form.Field>;
  }

  function DefinitionFormalField({ children }: CreateFieldProps<string>) {
    return (
      <form.Field name='item_data.definition_formal'>{field => children(field as FieldStateData<string>)}</form.Field>
    );
  }

  function DefinitionRawField({ children }: CreateFieldProps<string>) {
    return <form.Field name='item_data.definition_raw'>{field => children(field as FieldStateData<string>)}</form.Field>;
  }

  function ConventionField({ children }: CreateFieldProps<string>) {
    return <form.Field name='item_data.convention'>{field => children(field as FieldStateData<string>)}</form.Field>;
  }

  const editFields: FormEditCstFields = {
    AliasField,
    TermRawField,
    DefinitionFormalField,
    DefinitionRawField,
    ConventionField
  };

  function handleChangeCstType(newValue: CstType) {
    form.setFieldValue('item_data.cst_type', newValue);
    form.setFieldValue('item_data.alias', generateAlias(newValue, schema));
  }

  function handleToggleCrucial() {
    form.setFieldValue('item_data.crucial', !(values.item_data.crucial ?? false));
  }

  return (
    <ModalForm
      header='Редактирование конституенты'
      canSubmit={canSubmit}
      onSubmit={event => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
      validationHint={canSubmit ? '' : hintMsg.aliasInvalid}
      submitText='Сохранить'
      className='cc-column w-140 max-h-120 py-2 px-6'
    >
      <div className='cc-icons absolute z-pop left-2 top-2'>
        <MiniButton
          title='Детальное редактирование'
          noPadding
          icon={<IconRSForm size='1.25rem' className='text-primary' />}
          onClick={navigateToTarget}
        />
        <MiniButton
          title='Перейти к предку'
          noPadding
          icon={<IconChild size='1.25rem' className={target.is_inherited ? 'text-primary' : 'text-foreground-muted'} />}
          disabled={!target.is_inherited}
          onClick={editSource}
        />
      </div>

      <FormEditCst
        target={target}
        schema={schema}
        itemData={values.item_data}
        onChangeCstType={handleChangeCstType}
        onToggleCrucial={handleToggleCrucial}
        fields={editFields}
      />
    </ModalForm>
  );
}
