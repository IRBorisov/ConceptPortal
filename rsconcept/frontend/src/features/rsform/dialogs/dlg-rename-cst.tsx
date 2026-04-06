'use client';

import { useMemo } from 'react';
import { useForm, useStore } from '@tanstack/react-form';

import { HelpTopic } from '@/features/help';

import { TextInput } from '@/components/input';
import { ModalForm } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';
import { hintMsg } from '@/utils/labels';

import { schemaUpdateConstituenta, type UpdateConstituentaDTO } from '../backend/types';
import { useRSForm } from '../backend/use-rsform';
import { useUpdateConstituenta } from '../backend/use-update-constituenta';
import { SelectCstType } from '../components/select-cst-type';
import { type CstType } from '../models/rsform';
import { generateAlias, validateNewAlias } from '../models/rsform-api';

export interface DlgRenameCstProps {
  schemaID: number;
  targetID: number;
}

export function DlgRenameCst() {
  const { schemaID, targetID } = useDialogsStore(state => state.props as DlgRenameCstProps);
  const { updateConstituenta: cstUpdate } = useUpdateConstituenta();
  const { schema } = useRSForm({ itemID: schemaID });
  const target = schema.cstByID.get(targetID)!;

  const form = useForm({
    defaultValues: {
      target: targetID,
      item_data: {
        alias: target.alias,
        cst_type: target.cst_type
      }
    } as UpdateConstituentaDTO,
    validators: {
      onChange: schemaUpdateConstituenta
    },
    onSubmit: async ({ value }) => {
      await cstUpdate({ itemID: schemaID, data: value });
    }
  });

  const values = useStore(form.store, state => state.values);
  const alias = values.item_data.alias!;
  const cst_type = values.item_data.cst_type!;
  const canSubmit = useMemo(() => {
    const parsed = schemaUpdateConstituenta.safeParse(values).success;
    return parsed && alias !== target.alias && validateNewAlias(alias, cst_type, schema);
  }, [values, alias, cst_type, target.alias, schema]);

  function handleChangeType(newType: CstType) {
    form.setFieldValue('item_data.cst_type', newType);
    form.setFieldValue('item_data.alias', generateAlias(newType, schema));
  }

  return (
    <ModalForm
      header='Переименование конституенты'
      submitText='Переименовать'
      canSubmit={canSubmit}
      validationHint={canSubmit ? '' : hintMsg.aliasInvalid}
      onSubmit={event => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
      className='w-120 py-6 pr-3 pl-6 flex gap-3 justify-center items-center'
      helpTopic={HelpTopic.CC_CONSTITUENTA}
    >
      <SelectCstType
        id='dlg_cst_type' //
        value={cst_type}
        onChange={handleChangeType}
        disabled={target.is_inherited}
      />
      <form.Field name='item_data.alias'>
        {field => (
          <TextInput
            id='dlg_cst_alias' //
            dense
            label='Имя'
            className='w-28'
            value={field.state.value ?? ''}
            onChange={event => field.handleChange(event.target.value)}
            onBlur={field.handleBlur}
            error={field.state.meta.errors[0]?.message}
          />
        )}
      </form.Field>
    </ModalForm>
  );
}
