import { Table } from '@tanstack/react-table';

import CheckboxTristate from '@/components/ui/CheckboxTristate';

interface SelectAllProps<TData> {
  table: Table<TData>;
  setLastSelected: React.Dispatch<React.SetStateAction<string | undefined>>;
}

function SelectAll<TData>({ table, setLastSelected }: SelectAllProps<TData>) {
  function handleChange(value: boolean | null) {
    setLastSelected(undefined);
    table.toggleAllPageRowsSelected(value !== false);
  }

  return (
    <CheckboxTristate
      tabIndex={-1}
      title='Выделить все'
      value={
        !table.getIsAllPageRowsSelected() && table.getIsSomePageRowsSelected() ? null : table.getIsAllPageRowsSelected()
      }
      setValue={handleChange}
    />
  );
}

export default SelectAll;
