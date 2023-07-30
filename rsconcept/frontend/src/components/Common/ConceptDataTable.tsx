import DataTable, { createTheme, type TableProps } from 'react-data-table-component';

import { useConceptTheme } from '../../context/ThemeContext';

export interface SelectionInfo<T> {
  allSelected: boolean
  selectedCount: number
  selectedRows: T[]
}

createTheme('customDark', {
  text: {
    primary: 'rgba(228, 228, 231, 1)',
    secondary: 'rgba(228, 228, 231, 0.87)',
    disabled: 'rgba(228, 228, 231, 0.54)'
  },
  background: {
    default: '#002b36'
  },
  context: {
    background: '#3e014d',
    text: 'rgba(228, 228, 231, 0.87)'
  },
  highlightOnHover: {
    default: '#3e014d',
    text: 'rgba(228, 228, 231, 1)'
  },
  divider: {
    default: '#6b6b6b'
  },
  striped: {
    default: '#004859',
    text: 'rgba(228, 228, 231, 1)'
  },
  selected: {
    default: '#4b015c',
    text: 'rgba(228, 228, 231, 1)'
  }
}, 'dark');

function ConceptDataTable<T>({ theme, ...props }: TableProps<T>) {
  const { darkMode } = useConceptTheme();

  return (
    <DataTable<T>
      theme={ theme ?? (darkMode ? 'customDark' : '')}
      {...props}
    />
  );
}

export default ConceptDataTable;
