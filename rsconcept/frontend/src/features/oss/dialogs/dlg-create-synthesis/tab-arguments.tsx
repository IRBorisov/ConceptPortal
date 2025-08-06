'use client';

import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { Label, TextArea, TextInput } from '@/components/input';
import { useDialogsStore } from '@/stores/dialogs';

import { type ICreateSynthesisDTO } from '../../backend/types';
import { PickMultiOperation } from '../../components/pick-multi-operation';
import { SelectParent } from '../../components/select-parent';

import { type DlgCreateSynthesisProps } from './dlg-create-synthesis';

export function TabArguments() {
  const { manager } = useDialogsStore(state => state.props as DlgCreateSynthesisProps);
  const {
    register,
    control,
    formState: { errors }
  } = useFormContext<ICreateSynthesisDTO>();
  const inputs = useWatch({ control, name: 'arguments' });

  const references = manager.oss.replicas.filter(item => inputs.includes(item.original)).map(item => item.replica);
  const filtered = manager.oss.operations.filter(item => !references.includes(item.id));

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
            <PickMultiOperation items={filtered} value={field.value} onChange={field.onChange} rows={6} />
          )}
        />
      </div>
    </div>
  );
}
