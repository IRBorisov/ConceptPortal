'use client';

import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { Label } from '@/components/input';

import { type IUpdateOperationDTO } from '../../backend/types';
import { PickMultiOperation } from '../../components/pick-multi-operation';
import { type IOperationInput, type IOperationSchema, type IOperationSynthesis } from '../../models/oss';

interface TabArgumentsProps {
  oss: IOperationSchema;
  target: IOperationInput | IOperationSynthesis;
}

export function TabArguments({ oss, target }: TabArgumentsProps) {
  const { control, setValue } = useFormContext<IUpdateOperationDTO>();
  const args = useWatch({ control, name: 'arguments' });

  const replicas = oss.replicas
    .filter(item => args.includes(item.original) || item.original === target.id)
    .map(item => item.replica)
    .concat(oss.replicas.filter(item => args.includes(item.replica)).map(item => item.original));
  const potentialCycle = [target.id, ...replicas, ...oss.graph.expandAllOutputs([target.id])];
  const filtered = oss.operations.filter(item => !potentialCycle.includes(item.id));

  function handleChangeArguments(prev: number[], newValue: number[]) {
    setValue('arguments', newValue, { shouldValidate: true });
    if (prev.some(id => !newValue.includes(id))) {
      setValue('substitutions', []);
    }
  }

  return (
    <div className='cc-fade-in cc-column'>
      <Controller
        name='arguments'
        control={control}
        render={({ field }) => (
          <>
            <Label text={`Выбор аргументов: [ ${field.value.length} ]`} />
            <PickMultiOperation
              items={filtered}
              value={field.value}
              onChange={newValue => handleChangeArguments(field.value, newValue)}
              rows={8}
            />
          </>
        )}
      />
    </div>
  );
}
