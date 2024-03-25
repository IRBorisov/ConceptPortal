import { Row } from '@tanstack/react-table';

import Checkbox from '@/components/ui/Checkbox';

interface SelectRowProps<TData> {
  row: Row<TData>;
  setLastSelected: React.Dispatch<React.SetStateAction<string | undefined>>;
}

function SelectRow<TData>({ row, setLastSelected }: SelectRowProps<TData>) {
  function handleChange(value: boolean) {
    setLastSelected(row.id);
    row.toggleSelected(value);
  }

  return <Checkbox tabIndex={-1} value={row.getIsSelected()} setValue={handleChange} />;
}

export default SelectRow;
