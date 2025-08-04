'use client';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { Label } from '@/components/input';
import { useDialogsStore } from '@/stores/dialogs';

import { type IUpdateOperationDTO } from '../../backend/types';
import { PickMultiOperation } from '../../components/pick-multi-operation';

import { type DlgEditOperationProps } from './dlg-edit-operation';

export function TabArguments() {
  const { control, setValue } = useFormContext<IUpdateOperationDTO>();
  const { manager, target } = useDialogsStore(state => state.props as DlgEditOperationProps);
  const args = useWatch({ control, name: 'arguments' });

  const references = manager.oss.references
    .filter(item => args.includes(item.target) || item.target === target.id)
    .map(item => item.reference);
  const potentialCycle = [target.id, ...references, ...manager.oss.graph.expandAllOutputs([target.id])];
  const filtered = manager.oss.operations.filter(item => !potentialCycle.includes(item.id));

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
