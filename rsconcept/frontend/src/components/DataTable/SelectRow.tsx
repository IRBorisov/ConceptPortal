import { Row } from '@tanstack/react-table';

import Checkbox from '../Common/Checkbox';

interface SelectRowProps<TData> {
  row: Row<TData>
}

function SelectRow<TData>({ row }: SelectRowProps<TData>) {  
  return (
    <Checkbox
      tabIndex={-1}
      value={row.getIsSelected()}
      setValue={row.getToggleSelectedHandler()}
    />
  );
}

export default SelectRow;
