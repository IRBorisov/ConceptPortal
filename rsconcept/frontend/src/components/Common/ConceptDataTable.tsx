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
    default: '#111827'
  },
  highlightOnHover: {
    default: '#4d6080',
    text: 'rgba(228, 228, 231, 1)'
  },
  divider: {
    default: '#6b6b6b'
  },
  striped: {
    default: '#374151',
    text: 'rgba(228, 228, 231, 1)'
  },
  selected: {
    default: '#4d6080',
    text: 'rgba(228, 228, 231, 1)'
  }
}, 'dark');

createTheme('customLight', {
  divider: {
    default: '#d1d5db'
  },
  striped: {
    default: '#f0f2f7'
  },
}, 'light');

function ConceptDataTable<T>({ theme, ...props }: TableProps<T>) {
  const { darkMode } = useConceptTheme();

  return (
    <DataTable<T>
      theme={ theme ?? (darkMode ? 'customDark' : 'customLight')}
      {...props}
    />
  );
}

export default ConceptDataTable;
