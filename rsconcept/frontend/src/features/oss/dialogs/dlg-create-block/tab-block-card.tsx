'use client';

import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { TextArea, TextInput } from '@/components/input';
import { useDialogsStore } from '@/stores/dialogs';

import { type ICreateBlockDTO } from '../../backend/types';
import { SelectParent } from '../../components/select-parent';

import { type DlgCreateBlockProps } from './dlg-create-block';

export function TabBlockCard() {
  const { manager } = useDialogsStore(state => state.props as DlgCreateBlockProps);
  const {
    register,
    control,
    formState: { errors }
  } = useFormContext<ICreateBlockDTO>();
  const children_blocks = useWatch({ control, name: 'children_blocks' });
  const all_children = [
    ...children_blocks,
    ...manager.oss.hierarchy.expandAllOutputs(children_blocks.filter(id => id < 0).map(id => -id)).map(id => -id)
  ];

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
            items={manager.oss.blocks.filter(block => !all_children.includes(block.id))}
            value={field.value ? manager.oss.blockByID.get(field.value) ?? null : null}
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
