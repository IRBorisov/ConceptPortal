'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import { useForm, useWatch } from 'react-hook-form';

import { CstRenameSchema, ICstRenameDTO } from '@/backend/rsform/api';
import { useCstRename } from '@/backend/rsform/useCstRename';
import { SelectSingle, TextInput } from '@/components/ui/Input';
import { ModalForm } from '@/components/ui/Modal';
import { HelpTopic } from '@/models/miscellaneous';
import { CstType, IConstituenta, IRSForm } from '@/models/rsform';
import { generateAlias, validateNewAlias } from '@/models/rsformAPI';
import { useDialogsStore } from '@/stores/dialogs';
import { labelCstType } from '@/utils/labels';
import { SelectorCstType } from '@/utils/selectors';

export interface DlgRenameCstProps {
  schema: IRSForm;
  target: IConstituenta;
}

function DlgRenameCst() {
  const { schema, target } = useDialogsStore(state => state.props as DlgRenameCstProps);
  const { cstRename } = useCstRename();

  const { register, setValue, handleSubmit, control } = useForm<ICstRenameDTO>({
    resolver: zodResolver(CstRenameSchema),
    defaultValues: {
      target: target.id,
      alias: target.alias,
      cst_type: target.cst_type
    }
  });
  const alias = useWatch({ control, name: 'alias' });
  const cst_type = useWatch({ control, name: 'cst_type' });

  // TODO: validate in ZOD
  const validated = alias !== target.alias && validateNewAlias(alias, cst_type, schema);

  function onSubmit(data: ICstRenameDTO) {
    cstRename({ itemID: schema.id, data: data });
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
      canSubmit={validated}
      onSubmit={event => void handleSubmit(onSubmit)(event)}
      className={clsx('w-[30rem]', 'py-6 pr-3 pl-6 flex gap-3 justify-center items-center ')}
      helpTopic={HelpTopic.CC_CONSTITUENTA}
    >
      <SelectSingle
        id='dlg_cst_type'
        placeholder='Выберите тип'
        className='min-w-[16rem]'
        isDisabled={target.is_inherited}
        options={SelectorCstType}
        value={{
          value: cst_type,
          label: labelCstType(cst_type)
        }}
        onChange={data => handleChangeType(data?.value ?? CstType.BASE)}
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

export default DlgRenameCst;
