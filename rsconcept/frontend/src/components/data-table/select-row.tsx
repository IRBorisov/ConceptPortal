'use no memo';

import { type Row } from '@tanstack/react-table';

import { Checkbox } from '../input1';

interface SelectRowProps<TData> {
  row: Row<TData>;
  onChangeLastSelected: (newValue: string) => void;
}

export function SelectRow<TData>({ row, onChangeLastSelected }: SelectRowProps<TData>) {
  function handleChange(value: boolean) {
    onChangeLastSelected(row.id);
    row.toggleSelected(value);
  }

  return <Checkbox tabIndex={-1} value={row.getIsSelected()} onChange={handleChange} />;
}
