'use client';

import { useIntl } from 'react-intl';

import { useLabelUser } from '@/features/users';

import { createColumnHelper } from '@/components/data-table';
import { useWindowSize } from '@/hooks/use-window-size';
import { type RO } from '@/utils/meta';

import { type LibraryItem } from '../../backend/types';
import { BadgeLocation } from '../../components/badge-location';
import { useLibrarySearchStore } from '../../stores/library-search';

const columnHelper = createColumnHelper<RO<LibraryItem>>();

export function useLibraryColumns() {
  const { isSmall } = useWindowSize();
  const intl = useIntl();

  const getUserLabel = useLabelUser();
  const folderMode = useLibrarySearchStore(state => state.folderMode);

  return [
    ...(folderMode
      ? []
      : [
        columnHelper.accessor('location', {
          id: 'location',
          header: 'Путь',
          size: 50,
          minSize: 50,
          maxSize: 50,
          enableSorting: true,
          cell: props => <BadgeLocation location={props.getValue()} />,
          sortingFn: 'text'
        })
      ]),
    columnHelper.accessor('alias', {
      id: 'alias',
      header: 'Сокращение',
      size: 150,
      minSize: 80,
      maxSize: 150,
      enableSorting: true,
      cell: props => <span className='min-w-20'>{props.getValue()}</span>,
      sortingFn: 'text'
    }),
    columnHelper.accessor('title', {
      id: 'title',
      header: 'Название',
      size: 1200,
      minSize: 200,
      maxSize: 1200,
      enableSorting: true,
      sortingFn: 'text'
    }),
    columnHelper.accessor('owner', {
      id: 'owner',
      header: 'Владелец',
      size: 400,
      minSize: 100,
      maxSize: 400,
      cell: props => getUserLabel(props.getValue()),
      enableSorting: true,
      sortingFn: 'text'
    }),
    columnHelper.accessor('time_update', {
      id: 'time_update',
      header: () => <span className='min-w-20'>{isSmall ? 'Дата' : 'Обновлена'}</span>,
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
