'use no memo';

import { Table } from '@tanstack/react-table';

import { CheckboxTristate } from '../Input';

interface SelectAllProps<TData> {
  table: Table<TData>;
  resetLastSelected: () => void;
}

function SelectAll<TData>({ table, resetLastSelected }: SelectAllProps<TData>) {
  function handleChange(value: boolean | null) {
    resetLastSelected();
    table.toggleAllPageRowsSelected(value !== false);
  }

  return (
    <CheckboxTristate
      tabIndex={-1}
      title='Выделить все'
      value={
        !table.getIsAllPageRowsSelected() && table.getIsSomePageRowsSelected() ? null : table.getIsAllPageRowsSelected()
      }
      onChange={handleChange}
    />
  );
}

export default SelectAll;
