'use client';

import { useIntl } from 'react-intl';

import { useTx } from '@/i18n';
import { type LibraryItem, LibraryItemType } from '@rsconcept/domain/library';

import { useLabelUser } from '@/features/users/backend/use-label-user';

import { createColumnHelper } from '@/components/data-table';
import { useWindowSize } from '@/hooks/use-window-size';
import { globalIDs } from '@/utils/constants';

import { IconItemType } from '../../components/icon-item-type';

const columnHelper = createColumnHelper<LibraryItem>();

function labelItemType(tx: ReturnType<typeof useTx>, itemType: LibraryItemType): string {
  switch (itemType) {
    case LibraryItemType.RSFORM:
      return tx('tx.schema');
    case LibraryItemType.OSS:
      return tx('tx.oss.short');
    case LibraryItemType.RSMODEL:
      return tx('tx.model');
  }
}

export function useLibraryColumns() {
  const { isSmall } = useWindowSize();
  const intl = useIntl();
  const tx = useTx();

  const getUserLabel = useLabelUser();

  return [
    columnHelper.accessor('item_type', {
      id: 'item_type',
      header: '',
      size: 40,
      minSize: 40,
      maxSize: 40,
      enableSorting: false,
      cell: props => {
        const itemType = props.getValue();
        const label = labelItemType(tx, itemType);
        return (
          <span
            className='inline-flex'
            aria-label={label}
            data-tooltip-id={globalIDs.tooltip}
            data-tooltip-content={label}
          >
            <IconItemType value={itemType} />
          </span>
        );
      }
    }),
    columnHelper.accessor('alias', {
      id: 'alias',
      header: tx('tx.lib.alias'),
      size: 150,
      minSize: 80,
      maxSize: 150,
      enableSorting: true,
      cell: props => <span className='min-w-20 line-clamp-2 hover:line-clamp-none'>{props.getValue()}</span>,
      sortingFn: 'text'
    }),
    columnHelper.accessor('title', {
      id: 'title',
      header: tx('tx.lib.title'),
      size: 1200,
      minSize: 200,
      maxSize: 1200,
      enableSorting: true,
      sortingFn: 'text',
      cell: props => <span className='line-clamp-2 hover:line-clamp-none'>{props.getValue()}</span>
    }),
    columnHelper.accessor('owner', {
      id: 'owner',
      header: tx('tx.general.role.owner'),
      size: 400,
      minSize: 100,
      maxSize: 400,
      cell: props => getUserLabel(props.getValue()),
      enableSorting: true,
      sortingFn: 'text'
    }),
    columnHelper.accessor('time_update', {
      id: 'time_update',
      header: () => <span className='min-w-20'>{isSmall ? tx('tx.general.date') : tx('tx.general.date.updated')}</span>,
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
