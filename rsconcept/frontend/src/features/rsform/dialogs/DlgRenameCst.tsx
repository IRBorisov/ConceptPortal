'use client';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';

import { HelpTopic } from '@/features/help';

import { TextInput } from '@/components/Input';
import { ModalForm } from '@/components/Modal';
import { useDialogsStore } from '@/stores/dialogs';

import { type CstType, type ICstRenameDTO, schemaCstRename } from '../backend/types';
import { useCstRename } from '../backend/useCstRename';
import { SelectCstType } from '../components/SelectCstType';
import { type IConstituenta, type IRSForm } from '../models/rsform';
import { generateAlias, validateNewAlias } from '../models/rsformAPI';

export interface DlgRenameCstProps {
  schema: IRSForm;
  target: IConstituenta;
}

export function DlgRenameCst() {
  const { schema, target } = useDialogsStore(state => state.props as DlgRenameCstProps);
  const { cstRename } = useCstRename();

  const { register, setValue, handleSubmit, control } = useForm<ICstRenameDTO>({
    resolver: zodResolver(schemaCstRename),
    defaultValues: {
      target: target.id,
      alias: target.alias,
      cst_type: target.cst_type
    }
  });
  const alias = useWatch({ control, name: 'alias' });
  const cst_type = useWatch({ control, name: 'cst_type' });
  const isValid = alias !== target.alias && validateNewAlias(alias, cst_type, schema);

  function onSubmit(data: ICstRenameDTO) {
    return cstRename({ itemID: schema.id, data: data });
  }

  function handleChangeType(newType: CstType) {
    setValue('alias', generateAlias(newType, schema));
    setValue('cst_type', newType);
  }

  return (
    <ModalForm
      header='Переименование конституенты'
      submitText='Переименовать'
      submitInvalidTooltip='Введите незанятое имя, соответствующее типу'
      canSubmit={isValid}
      onSubmit={event => void handleSubmit(onSubmit)(event)}
      className={clsx('w-[30rem]', 'py-6 pr-3 pl-6 flex gap-3 justify-center items-center ')}
      helpTopic={HelpTopic.CC_CONSTITUENTA}
    >
      <SelectCstType
        id='dlg_cst_type'
        className='w-[16rem]'
        value={cst_type}
        onChange={handleChangeType}
        disabled={target.is_inherited}
      />
      <TextInput
        id='dlg_cst_alias' //
        {...register('alias')}
        dense
        label='Имя'
        className='w-[7rem]'
      />
    </ModalForm>
  );
}
