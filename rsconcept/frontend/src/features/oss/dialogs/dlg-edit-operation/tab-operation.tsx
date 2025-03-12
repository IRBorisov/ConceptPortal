import { useFormContext } from 'react-hook-form';

import { TextArea, TextInput } from '@/components/input1';

import { type IOperationUpdateDTO } from '../../backend/types';

export function TabOperation() {
  const {
    register,
    formState: { errors }
  } = useFormContext<IOperationUpdateDTO>();

  return (
    <div className='cc-fade-in cc-column'>
      <TextInput
        id='operation_title'
        label='Полное название'
        {...register('item_data.title')}
        error={errors.item_data?.title}
      />
      <div className='flex gap-6'>
        <TextInput
          id='operation_alias'
          label='Сокращение'
          className='w-64'
          {...register('item_data.alias')}
          error={errors.item_data?.alias}
        />

        <TextArea
          id='operation_comment'
          label='Описание'
          noResize
          rows={3}
          {...register('item_data.comment')}
          error={errors.item_data?.comment}
        />
      </div>
    </div>
  );
}
