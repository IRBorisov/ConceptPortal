import { IconSortAsc, IconSortDesc } from '../icons';

interface SortingIconProps {
  sortDirection?: 'asc' | 'desc' | false;
}

export function SortingIcon({ sortDirection }: SortingIconProps) {
  if (sortDirection === 'asc') {
    return <IconSortAsc size='1rem' />;
  }
  if (sortDirection === 'desc') {
    return <IconSortDesc size='1rem' />;
  }
  return <IconSortDesc size='1rem' className='opacity-0 group-hover:opacity-25 transition-opacity' />;
}
