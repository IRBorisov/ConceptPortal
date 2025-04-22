'use client';

import { Controller, useFormContext } from 'react-hook-form';

import { TextArea, TextInput } from '@/components/input';
import { useDialogsStore } from '@/stores/dialogs';

import { type ICreateBlockDTO } from '../../backend/types';
import { SelectParent } from '../../components/select-parent';

import { type DlgCreateBlockProps } from './dlg-create-block';

export function TabBlockCard() {
  const { oss } = useDialogsStore(state => state.props as DlgCreateBlockProps);
  const {
    register,
    control,
    formState: { errors }
  } = useFormContext<ICreateBlockDTO>();

  return (
    <div className='cc-fade-in cc-column'>
      <TextInput
        id='operation_title' //
        label='Название'
        {...register('item_data.title')}
        error={errors.item_data?.title}
      />
      <Controller
        name='item_data.parent'
        control={control}
        render={({ field }) => (
          <SelectParent
            items={oss.blocks}
            value={field.value ? oss.blockByID.get(field.value) ?? null : null}
            placeholder='Блок содержания не выбран'
            onChange={value => field.onChange(value ? value.id : null)}
          />
        )}
      />

      <TextArea
        id='operation_comment' //
        label='Описание'
        noResize
        rows={5}
        {...register('item_data.description')}
      />
    </div>
  );
}
