import { Controller, useFormContext } from 'react-hook-form';

import { TextArea, TextInput } from '@/components/input';
import { useDialogsStore } from '@/stores/dialogs';

import { type IUpdateOperationDTO } from '../../backend/types';
import { SelectBlock } from '../../components/select-block';

import { type DlgEditOperationProps } from './dlg-edit-operation';

export function TabOperation() {
  const { oss } = useDialogsStore(state => state.props as DlgEditOperationProps);
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
      <div className='flex gap-6'>
        <div className='grid gap-1'>
          <TextInput
            id='operation_alias' //
            label='Сокращение'
            className='w-64'
            {...register('item_data.alias')}
            error={errors.item_data?.alias}
          />
          <Controller
            name='item_data.parent'
            control={control}
            render={({ field }) => (
              <SelectBlock
                items={oss.blocks}
                value={field.value ? oss.blockByID.get(field.value) ?? null : null}
                placeholder='Блок содержания'
                onChange={value => field.onChange(value ? value.id : null)}
              />
            )}
          />
        </div>
        <TextArea
          id='operation_comment'
          label='Описание'
          noResize
          rows={3}
          {...register('item_data.description')}
          error={errors.item_data?.description}
        />
      </div>
    </div>
  );
}
