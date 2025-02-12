import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { FlexColumn } from '@/components/Container';
import { Label, TextArea, TextInput } from '@/components/Input';
import { useDialogsStore } from '@/stores/dialogs';

import { IOperationCreateDTO } from '../../backend/types';
import { PickMultiOperation } from '../../components/PickMultiOperation';

import { DlgCreateOperationProps } from './DlgCreateOperation';

function TabSynthesisOperation() {
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
          className='w-[16rem]'
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

      <FlexColumn>
        <Label text={`Выбор аргументов: [ ${inputs.length} ]`} />
        <Controller
          name='arguments'
          control={control}
          render={({ field }) => (
            <PickMultiOperation items={oss.items} value={field.value} onChange={field.onChange} rows={6} />
          )}
        />
      </FlexColumn>
    </div>
  );
}

export default TabSynthesisOperation;
