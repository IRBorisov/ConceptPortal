'use client';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { HelpTopic } from '@/features/help';

import { TextInput } from '@/components/input';
import { ModalForm } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';

import { type CstType, type IUpdateConstituentaDTO, schemaUpdateConstituenta } from '../backend/types';
import { useRSFormSuspense } from '../backend/use-rsform';
import { useUpdateConstituenta } from '../backend/use-update-constituenta';
import { SelectCstType } from '../components/select-cst-type';
import { generateAlias, validateNewAlias } from '../models/rsform-api';

export interface DlgRenameCstProps {
  schemaID: number;
  targetID: number;
}

export function DlgRenameCst() {
  const { schemaID, targetID } = useDialogsStore(state => state.props as DlgRenameCstProps);
  const { updateConstituenta: cstUpdate } = useUpdateConstituenta();
  const { schema } = useRSFormSuspense({ itemID: schemaID });
  const target = schema.cstByID.get(targetID)!;

  const { register, setValue, handleSubmit, control } = useForm<IUpdateConstituentaDTO>({
    resolver: zodResolver(schemaUpdateConstituenta),
    defaultValues: {
      target: targetID,
      item_data: {
        alias: target.alias,
        cst_type: target.cst_type
      }
    }
  });
  const alias = useWatch({ control, name: 'item_data.alias' })!;
  const cst_type = useWatch({ control, name: 'item_data.cst_type' })!;
  const isValid = alias !== target.alias && validateNewAlias(alias, cst_type, schema);

  function onSubmit(data: IUpdateConstituentaDTO) {
    return cstUpdate({ itemID: schemaID, data: data });
  }

  function handleChangeType(newType: CstType) {
    setValue('item_data.cst_type', newType);
    setValue('item_data.alias', generateAlias(newType, schema), { shouldValidate: true });
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
        {...register('item_data.alias')}
        dense
        label='Имя'
        className='w-28'
      />
    </ModalForm>
  );
}
