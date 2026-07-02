'use no memo';
'use client';

import { type Table } from '@tanstack/react-table';

import { useTx } from '@/i18n';

import { CheckboxTristate } from '../input';

interface SelectAllProps<TData> {
  /** TanStack table instance. */
  table: Table<TData>;

  /** Clears shift-click range selection anchor. */
  resetLastSelected: () => void;
}

/** Tri-state checkbox that toggles selection of all rows on the current page. */
export function SelectAll<TData>({ table, resetLastSelected }: SelectAllProps<TData>) {
  const tx = useTx();
  function handleChange(value: boolean | null) {
    resetLastSelected();
    table.toggleAllPageRowsSelected(value !== false);
  }

  return (
    <CheckboxTristate
      tabIndex={-1}
      title={tx('tx.general.selection.selectAll')}
      value={
        !table.getIsAllPageRowsSelected() && table.getIsSomePageRowsSelected() ? null : table.getIsAllPageRowsSelected()
      }
      onChange={handleChange}
    />
  );
}
