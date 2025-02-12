'use client';
import { Controller, useFormContext } from 'react-hook-form';

import { FlexColumn } from '@/components/Container';
import { Label } from '@/components/Input';
import { useDialogsStore } from '@/stores/dialogs';

import { IOperationUpdateDTO } from '../../backend/api';
import { PickMultiOperation } from '../../components/PickMultiOperation';
import { DlgEditOperationProps } from './DlgEditOperation';

function TabArguments() {
  const { control, setValue } = useFormContext<IOperationUpdateDTO>();
  const { oss, target } = useDialogsStore(state => state.props as DlgEditOperationProps);
  const potentialCycle = [target.id, ...oss.graph.expandAllOutputs([target.id])];
  const filtered = oss.items.filter(item => !potentialCycle.includes(item.id));

  function handleChangeArguments(prev: number[], newValue: number[]) {
    setValue('arguments', newValue);
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

export default TabArguments;
