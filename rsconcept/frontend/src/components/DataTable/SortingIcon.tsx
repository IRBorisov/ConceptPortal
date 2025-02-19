'use no memo';

import { Column } from '@tanstack/react-table';

import { IconSortAsc, IconSortDesc } from '../Icons';

interface SortingIconProps<TData> {
  column: Column<TData>;
}

export function SortingIcon<TData>({ column }: SortingIconProps<TData>) {
  return (
    <>
      {{
        desc: <IconSortDesc size='1rem' />,
        asc: <IconSortAsc size='1rem' />
      }[column.getIsSorted() as string] ?? <IconSortDesc size='1rem' className='opacity-0 hover:opacity-50' />}
    </>
  );
}
