import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { Label, TextArea, TextInput } from '@/components/input';
import { useDialogsStore } from '@/stores/dialogs';

import { type ICreateOperationDTO } from '../../backend/types';
import { PickMultiOperation } from '../../components/pick-multi-operation';
import { SelectBlock } from '../../components/select-block';

import { type DlgCreateOperationProps } from './dlg-create-operation';

export function TabSynthesisOperation() {
  const { oss } = useDialogsStore(state => state.props as DlgCreateOperationProps);
  const {
    register,
    control,
    formState: { errors }
  } = useFormContext<ICreateOperationDTO>();
  const inputs = useWatch({ control, name: 'arguments' });

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

      <div className='cc-column'>
        <Label text={`Выбор аргументов: [ ${inputs.length} ]`} />
        <Controller
          name='arguments'
          control={control}
          render={({ field }) => (
            <PickMultiOperation items={oss.operations} value={field.value} onChange={field.onChange} rows={6} />
          )}
        />
      </div>
    </div>
  );
}
