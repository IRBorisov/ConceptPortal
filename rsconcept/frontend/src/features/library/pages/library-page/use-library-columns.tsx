'use client';

import { useIntl } from 'react-intl';

import { type LibraryItem } from '@/domain/library';

import { useTx } from '@/app/i18n/use-tx';
import { useLabelUser } from '@/features/users';

import { createColumnHelper } from '@/components/data-table';
import { useWindowSize } from '@/hooks/use-window-size';
import { type RO } from '@/utils/meta';

const columnHelper = createColumnHelper<RO<LibraryItem>>();

export function useLibraryColumns() {
  const { isSmall } = useWindowSize();
  const intl = useIntl();
  const tx = useTx();

  const getUserLabel = useLabelUser();

  return [
    columnHelper.accessor('alias', {
      id: 'alias',
      header: tx('lib.col.alias', 'Alias'),
      size: 150,
      minSize: 80,
      maxSize: 150,
      enableSorting: true,
      cell: props => <span className='min-w-20 line-clamp-2 hover:line-clamp-none'>{props.getValue()}</span>,
      sortingFn: 'text'
    }),
    columnHelper.accessor('title', {
      id: 'title',
      header: tx('lib.col.title', 'Title'),
      size: 1200,
      minSize: 200,
      maxSize: 1200,
      enableSorting: true,
      sortingFn: 'text',
      cell: props => <span className='line-clamp-2 hover:line-clamp-none'>{props.getValue()}</span>
    }),
    columnHelper.accessor('owner', {
      id: 'owner',
      header: tx('lib.col.owner', 'Owner'),
      size: 400,
      minSize: 100,
      maxSize: 400,
      cell: props => getUserLabel(props.getValue()),
      enableSorting: true,
      sortingFn: 'text'
    }),
    columnHelper.accessor('time_update', {
      id: 'time_update',
      header: () => (
        <span className='min-w-20'>
          {isSmall ? tx('lib.col.dateShort', 'Date') : tx('lib.col.dateLong', 'Updated')}
        </span>
      ),
      cell: props => (
        <span className='whitespace-nowrap'>
          {new Date(props.getValue()).toLocaleString(intl.locale, {
            year: '2-digit',
            month: '2-digit',
            day: '2-digit',
            ...(!isSmall && {
              hour: '2-digit',
              minute: '2-digit'
            })
          })}
        </span>
      ),
      enableSorting: true,
      sortingFn: 'datetime',
      sortDescFirst: true
    })
  ];
}
