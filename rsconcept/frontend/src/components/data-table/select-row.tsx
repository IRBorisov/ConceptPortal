'use no memo';

import { type Row } from '@tanstack/react-table';

import { Checkbox } from '../input';

interface SelectRowProps<TData> {
  /** TanStack row instance. */
  row: Row<TData>;

  /** Updates the last-selected row id for shift-click range selection. */
  onChangeLastSelected: (newValue: string) => void;
}

/** Checkbox that toggles selection for a single table row. */
export function SelectRow<TData>({ row, onChangeLastSelected }: SelectRowProps<TData>) {
  function handleChange(value: boolean) {
    onChangeLastSelected(row.id);
    row.toggleSelected(value);
  }

  return <Checkbox tabIndex={-1} value={row.getIsSelected()} onChange={handleChange} ignoreShiftClick />;
}
