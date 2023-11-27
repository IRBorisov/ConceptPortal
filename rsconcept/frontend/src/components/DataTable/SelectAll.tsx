import { Table } from '@tanstack/react-table';

import Tristate from '../common/Tristate';

interface SelectAllProps<TData> {
  table: Table<TData>
}

function SelectAll<TData>({ table }: SelectAllProps<TData>) {  
  return (
  <Tristate tabIndex={-1}
    tooltip='Выделить все'
    value={
      (!table.getIsAllPageRowsSelected() && table.getIsSomePageRowsSelected())
      ? null
      : table.getIsAllPageRowsSelected()
    }
    setValue={value => table.toggleAllPageRowsSelected(value !== false)}
  />);
}

export default SelectAll;
