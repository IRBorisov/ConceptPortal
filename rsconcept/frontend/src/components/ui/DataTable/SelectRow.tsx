'use no memo';

import { Row } from '@tanstack/react-table';

import Checkbox from '@/components/ui/Checkbox';

interface SelectRowProps<TData> {
  row: Row<TData>;
  onChangeLastSelected: (newValue: string | undefined) => void;
}

function SelectRow<TData>({ row, onChangeLastSelected }: SelectRowProps<TData>) {
  function handleChange(value: boolean) {
    onChangeLastSelected(row.id);
    row.toggleSelected(value);
  }

  return <Checkbox tabIndex={-1} value={row.getIsSelected()} setValue={handleChange} />;
}

export default SelectRow;
