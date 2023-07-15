import DataTable, { createTheme } from 'react-data-table-component';
import { TableProps } from 'react-data-table-component';
import { useTheme } from '../../context/ThemeContext';

export interface SelectionInfo<T> {
  allSelected: boolean;
  selectedCount: number;
  selectedRows: T[];
}

createTheme('customDark', {
  text: {
    primary: 'rgba(228, 228, 231, 1)',
    secondary: 'rgba(228, 228, 231, 0.87)',
    disabled: 'rgba(228, 228, 231, 0.54)',
  },
  background: {
    default: '#002b36',
  },
  context: {
    background: '#cb4b16',
    text: 'rgba(228, 228, 231, 0.87)',
  },
  divider: {
    default: '#6b6b6b',
  },
  striped: {
		default: '#004859',
		text: 'rgba(228, 228, 231, 1)',
	},
}, 'dark');

function DataTableThemed<T>({theme, ...props}: TableProps<T>) {
  const { darkMode } = useTheme();

  return (
    <DataTable<T>
      theme={ theme ? theme : darkMode ? 'customDark' : ''}
      {...props}
    />
  );
}

export default DataTableThemed;
