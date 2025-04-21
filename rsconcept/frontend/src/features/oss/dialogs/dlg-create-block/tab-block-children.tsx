'use client';
import { useFormContext, useWatch } from 'react-hook-form';

import { Label } from '@/components/input';
import { useDialogsStore } from '@/stores/dialogs';

import { type ICreateBlockDTO } from '../../backend/types';
import { PickContents } from '../../components/pick-contents';

import { type DlgCreateBlockProps } from './dlg-create-block';

export function TabBlockChildren() {
  const { setValue, control } = useFormContext<ICreateBlockDTO>();
  const { oss } = useDialogsStore(state => state.props as DlgCreateBlockProps);
  const children_blocks = useWatch({ control, name: 'children_blocks' });
  const children_operations = useWatch({ control, name: 'children_operations' });

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
      <PickContents schema={oss} value={value} onChange={newValue => handleChangeSelected(newValue)} rows={8} />
    </div>
  );
}
