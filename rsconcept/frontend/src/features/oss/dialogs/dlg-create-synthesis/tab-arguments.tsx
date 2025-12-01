'use client';

import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { Label, TextArea, TextInput } from '@/components/input';

import { type ICreateSynthesisDTO } from '../../backend/types';
import { PickMultiOperation } from '../../components/pick-multi-operation';
import { SelectParent } from '../../components/select-parent';
import { type IOperationSchema } from '../../models/oss';

interface TabArgumentsProps {
  oss: IOperationSchema;
}

export function TabArguments({ oss }: TabArgumentsProps) {
  const {
    register,
    control,
    formState: { errors }
  } = useFormContext<ICreateSynthesisDTO>();
  const inputs = useWatch({ control, name: 'arguments' });

  const replicas = oss.replicas
    .filter(item => inputs.includes(item.original))
    .map(item => item.replica)
    .concat(oss.replicas.filter(item => inputs.includes(item.replica)).map(item => item.original));
  const filtered = oss.operations.filter(item => !replicas.includes(item.id));

  return (
    <div className='cc-fade-in cc-column'>
      <TextInput
        id='operation_title'
        label='Название'
        placeholder='Введите название'
        {...register('item_data.title')}
        error={errors.item_data?.title}
      />
      <div className='flex gap-6'>
        <div className='grid gap-1'>
          <TextInput
            id='operation_alias' //
            label='Сокращение'
            placeholder='Введите сокращение'
            className='w-80'
            {...register('item_data.alias')}
            error={errors.item_data?.alias}
          />
          <Controller
            name='item_data.parent'
            control={control}
            render={({ field }) => (
              <SelectParent
                items={oss.blocks}
                value={field.value ? oss.blockByID.get(field.value) ?? null : null}
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
            <PickMultiOperation items={filtered} value={field.value ?? []} onChange={field.onChange} rows={6} />
          )}
        />
      </div>
    </div>
  );
}
