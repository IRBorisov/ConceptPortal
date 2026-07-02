import { IconSortAsc, IconSortDesc } from '../icons';

interface SortingIconProps {
  /** Current sort direction for the column. */
  sortDirection?: 'asc' | 'desc' | false;
}

/** Sort direction indicator shown in sortable column headers. */
export function SortingIcon({ sortDirection }: SortingIconProps) {
  if (sortDirection === 'asc') {
    return <IconSortAsc size='1rem' />;
  }
  if (sortDirection === 'desc') {
    return <IconSortDesc size='1rem' />;
  }
  return <IconSortDesc size='1rem' className='opacity-0 group-hover:opacity-25 transition-opacity' />;
}
