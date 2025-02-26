'use client';
import { Controller, useFormContext } from 'react-hook-form';

import { FlexColumn } from '@/components/Container';
import { Label } from '@/components/Input';
import { useDialogsStore } from '@/stores/dialogs';

import { type IOperationUpdateDTO } from '../../backend/types';
import { PickMultiOperation } from '../../components/PickMultiOperation';

import { type DlgEditOperationProps } from './DlgEditOperation';

export function TabArguments() {
  const { control, setValue } = useFormContext<IOperationUpdateDTO>();
  const { oss, target } = useDialogsStore(state => state.props as DlgEditOperationProps);
  const potentialCycle = [target.id, ...oss.graph.expandAllOutputs([target.id])];
  const filtered = oss.items.filter(item => !potentialCycle.includes(item.id));

  function handleChangeArguments(prev: number[], newValue: number[]) {
    setValue('arguments', newValue, { shouldValidate: true });
    if (prev.some(id => !newValue.includes(id))) {
      setValue('substitutions', []);
    }
  }

  return (
    <div className='cc-fade-in cc-column'>
      <FlexColumn>
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
      </FlexColumn>
    </div>
  );
}
