import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { Label, TextArea, TextInput } from '@/components/input';
import { useDialogsStore } from '@/stores/dialogs';

import { type IOperationCreateDTO } from '../../backend/types';
import { PickMultiOperation } from '../../components/pick-multi-operation';

import { type DlgCreateOperationProps } from './dlg-create-operation';

export function TabSynthesisOperation() {
  const { oss } = useDialogsStore(state => state.props as DlgCreateOperationProps);
  const {
    register,
    control,
    formState: { errors }
  } = useFormContext<IOperationCreateDTO>();
  const inputs = useWatch({ control, name: 'arguments' });

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

      <div className='cc-column'>
        <Label text={`Выбор аргументов: [ ${inputs.length} ]`} />
        <Controller
          name='arguments'
          control={control}
          render={({ field }) => (
            <PickMultiOperation items={oss.items} value={field.value} onChange={field.onChange} rows={6} />
          )}
        />
      </div>
    </div>
  );
}
