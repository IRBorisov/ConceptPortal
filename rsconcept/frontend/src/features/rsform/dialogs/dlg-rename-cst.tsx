'use client';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { HelpTopic } from '@/features/help';

import { TextInput } from '@/components/input';
import { ModalForm } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';

import { type CstType, type IRenameConstituentaDTO, schemaRenameConstituenta } from '../backend/types';
import { useRenameConstituenta } from '../backend/use-rename-constituenta';
import { SelectCstType } from '../components/select-cst-type';
import { type IConstituenta, type IRSForm } from '../models/rsform';
import { generateAlias, validateNewAlias } from '../models/rsform-api';

export interface DlgRenameCstProps {
  schema: IRSForm;
  target: IConstituenta;
}

export function DlgRenameCst() {
  const { schema, target } = useDialogsStore(state => state.props as DlgRenameCstProps);
  const { renameConstituenta: cstRename } = useRenameConstituenta();

  const { register, setValue, handleSubmit, control } = useForm<IRenameConstituentaDTO>({
    resolver: zodResolver(schemaRenameConstituenta),
    defaultValues: {
      target: target.id,
      alias: target.alias,
      cst_type: target.cst_type
    }
  });
  const alias = useWatch({ control, name: 'alias' });
  const cst_type = useWatch({ control, name: 'cst_type' });
  const isValid = alias !== target.alias && validateNewAlias(alias, cst_type, schema);

  function onSubmit(data: IRenameConstituentaDTO) {
    return cstRename({ itemID: schema.id, data: data });
  }

  function handleChangeType(newType: CstType) {
    setValue('cst_type', newType);
    setValue('alias', generateAlias(newType, schema), { shouldValidate: true });
  }

  return (
    <ModalForm
      header='Переименование конституенты'
      submitText='Переименовать'
      submitInvalidTooltip='Введите незанятое имя, соответствующее типу'
      canSubmit={isValid}
      onSubmit={event => void handleSubmit(onSubmit)(event)}
      className='w-120 py-6 pr-3 pl-6 flex gap-3 justify-center items-center'
      helpTopic={HelpTopic.CC_CONSTITUENTA}
    >
      <SelectCstType
        id='dlg_cst_type' //
        value={cst_type}
        onChange={handleChangeType}
        disabled={target.is_inherited}
      />
      <TextInput
        id='dlg_cst_alias' //
        {...register('alias')}
        dense
        label='Имя'
        className='w-28'
      />
    </ModalForm>
  );
}
