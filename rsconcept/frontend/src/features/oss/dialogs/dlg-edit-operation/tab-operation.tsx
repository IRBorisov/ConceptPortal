import { Controller, useFormContext } from 'react-hook-form';

import { TextArea, TextInput } from '@/components/input';
import { useDialogsStore } from '@/stores/dialogs';

import { type IUpdateOperationDTO } from '../../backend/types';
import { SelectParent } from '../../components/select-parent';

import { type DlgEditOperationProps } from './dlg-edit-operation';

export function TabOperation() {
  const { manager } = useDialogsStore(state => state.props as DlgEditOperationProps);
  const {
    register,
    control,
    formState: { errors }
  } = useFormContext<IUpdateOperationDTO>();

  return (
    <div className='cc-fade-in cc-column'>
      <TextInput
        id='operation_title'
        label='Название'
        {...register('item_data.title')}
        error={errors.item_data?.title}
      />

      <TextInput
        id='operation_alias' //
        label='Сокращение'
        className='w-80'
        {...register('item_data.alias')}
        error={errors.item_data?.alias}
      />
      <Controller
        name='item_data.parent'
        control={control}
        render={({ field }) => (
          <SelectParent
            items={manager.oss.blocks}
            value={field.value ? manager.oss.blockByID.get(field.value) ?? null : null}
            placeholder='Родительский блок'
            onChange={value => field.onChange(value ? value.id : null)}
          />
        )}
      />

      <TextArea
        id='operation_comment'
        label='Описание'
        noResize
        rows={5}
        {...register('item_data.description')}
        error={errors.item_data?.description}
      />
    </div>
  );
}
