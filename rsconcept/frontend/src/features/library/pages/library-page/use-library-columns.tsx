import { useIntl } from 'react-intl';

import { useLabelUser } from '@/features/users';

import { MiniButton } from '@/components/control';
import { createColumnHelper } from '@/components/data-table';
import { IconFolderTree } from '@/components/icons';
import { useWindowSize } from '@/hooks/use-window-size';
import { type RO } from '@/utils/meta';

import { type ILibraryItem } from '../../backend/types';
import { BadgeLocation } from '../../components/badge-location';
import { useLibrarySearchStore } from '../../stores/library-search';

const columnHelper = createColumnHelper<RO<ILibraryItem>>();

export function useLibraryColumns() {
  const { isSmall } = useWindowSize();
  const intl = useIntl();

  const getUserLabel = useLabelUser();
  const folderMode = useLibrarySearchStore(state => state.folderMode);
  const toggleFolderMode = useLibrarySearchStore(state => state.toggleFolderMode);

  function handleToggleFolder(event: React.MouseEvent<Element>) {
    event.preventDefault();
    event.stopPropagation();
    toggleFolderMode();
  }

  return [
    ...(folderMode
      ? []
      : [
          columnHelper.accessor('location', {
            id: 'location',
            header: () => (
              <MiniButton
                titleHtml='Переключение в режим Проводник'
                aria-label='Переключатель режима Проводник'
                noPadding
                noHover
                className='pl-2 max-h-4 -translate-y-0.5'
                onClick={handleToggleFolder}
                icon={<IconFolderTree size='1.25rem' className='text-muted-foreground hover:text-primary' />}
              />
            ),
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
      header: 'Шифр',
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
    columnHelper.accessor(item => item.owner ?? 0, {
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
      header: isSmall ? 'Дата' : 'Обновлена',
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
