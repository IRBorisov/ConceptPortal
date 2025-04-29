'use client';
import { useFormContext, useWatch } from 'react-hook-form';

import { Label } from '@/components/input';
import { useDialogsStore } from '@/stores/dialogs';

import { type ICreateBlockDTO } from '../../backend/types';
import { PickContents } from '../../components/pick-contents';

import { type DlgCreateBlockProps } from './dlg-create-block';

export function TabBlockChildren() {
  const { setValue, control } = useFormContext<ICreateBlockDTO>();
  const { manager } = useDialogsStore(state => state.props as DlgCreateBlockProps);
  const parent = useWatch({ control, name: 'item_data.parent' });
  const children_blocks = useWatch({ control, name: 'children_blocks' });
  const children_operations = useWatch({ control, name: 'children_operations' });
  const exclude = parent ? [-parent, ...manager.oss.hierarchy.expandAllInputs([-parent]).filter(id => id < 0)] : [];

  console.log(exclude);

  const value = [...children_blocks.map(id => -id), ...children_operations];

  function handleChangeSelected(newValue: number[]) {
    setValue(
      'children_blocks',
      newValue.filter(id => id < 0).map(id => -id),
      { shouldValidate: true }
    );
    setValue(
      'children_operations',
      newValue.filter(id => id > 0),
      { shouldValidate: true }
    );
  }

  return (
    <div className='cc-fade-in cc-column'>
      <Label text={`Выбор содержания: [ ${value.length} ]`} />
      <PickContents
        schema={manager.oss}
        exclude={exclude}
        value={value}
        onChange={newValue => handleChangeSelected(newValue)}
        rows={10}
      />
    </div>
  );
}
