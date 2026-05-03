'use no memo';
'use client';

import { type Table } from '@tanstack/react-table';

import { useTx } from '@/i18n';

import { CheckboxTristate } from '../input';

interface SelectAllProps<TData> {
  table: Table<TData>;
  resetLastSelected: () => void;
}

export function SelectAll<TData>({ table, resetLastSelected }: SelectAllProps<TData>) {
  const tx = useTx();
  function handleChange(value: boolean | null) {
    resetLastSelected();
    table.toggleAllPageRowsSelected(value !== false);
  }

  return (
    <CheckboxTristate
      tabIndex={-1}
      title={tx('semantic.action.selectAll')}
      value={
        !table.getIsAllPageRowsSelected() && table.getIsSomePageRowsSelected() ? null : table.getIsAllPageRowsSelected()
      }
      onChange={handleChange}
    />
  );
}
