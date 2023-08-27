import DataTable, { createTheme, type TableProps } from 'react-data-table-component';

import { useConceptTheme } from '../../context/ThemeContext';
import { dataTableDarkT, dataTableLightT } from '../../utils/color';

export interface SelectionInfo<T> {
  allSelected: boolean
  selectedCount: number
  selectedRows: T[]
}

createTheme('customDark', dataTableDarkT, 'dark');
createTheme('customLight', dataTableLightT, 'light');

interface ConceptDataTableProps<T>
extends Omit<TableProps<T>, 'paginationComponentOptions'> {}

function ConceptDataTable<T>({ theme, ...props }: ConceptDataTableProps<T>) {
  const { darkMode } = useConceptTheme();

  return (
    <DataTable<T>
      theme={ theme ?? (darkMode ? 'customDark' : 'customLight')}
      paginationComponentOptions={{
        rowsPerPageText: 'строк на страницу'
      }}
      {...props}
    />
  );
}

export default ConceptDataTable;
