'use client';

import { useMemo } from 'react';
import { useForm, useStore } from '@tanstack/react-form';

import { type Constituenta, type CstType, type RSForm } from '@/domain/library';
import { generateAlias, validateNewAlias } from '@/domain/library/rsform-api';
import { formatLabel, lid,useTx  } from '@/i18n';

import { HelpTopic } from '@/features/help';

import { TextInput } from '@/components/input';
import { ModalForm } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';
import { withPreventDefault } from '@/utils/utils';

import { schemaUpdateConstituenta, type UpdateConstituentaDTO } from '../backend/types';
import { SelectCstType } from '../components/select-cst-type';

export interface DlgRenameCstProps {
  schema: RSForm;
  target: Constituenta;
  onRename: (data: UpdateConstituentaDTO) => void;
}

export function DlgRenameCst() {
  const tx = useTx();
  const { schema, target, onRename } = useDialogsStore(state => state.props as DlgRenameCstProps);
  const defaultValues: UpdateConstituentaDTO = {
    target: target.id,
    item_data: {
      alias: target.alias,
      cst_type: target.cst_type
    }
  };

  const form = useForm({
    defaultValues,
    validators: {
      onChange: schemaUpdateConstituenta
    },
    onSubmit: ({ value }) => onRename(value)
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
      header={tx('ui.dlg.renameCst.header', 'Rename constituent')}
      submitText={tx('ui.action.rename', 'Rename')}
      canSubmit={canSubmit}
      validationHint={canSubmit ? '' : formatLabel(lid.hint.aliasInvalid)}
      onSubmit={withPreventDefault(() => void form.handleSubmit())}
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
            id='dlg_cst_alias'
            dense
            label={tx('ui.label.name', 'Name')}
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
