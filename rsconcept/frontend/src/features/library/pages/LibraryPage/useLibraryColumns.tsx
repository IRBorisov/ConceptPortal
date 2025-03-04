import { useIntl } from 'react-intl';

import { useLabelUser } from '@/features/users';

import { MiniButton } from '@/components/Control';
import { createColumnHelper } from '@/components/DataTable';
import { IconFolderTree } from '@/components/Icons';
import { useWindowSize } from '@/hooks/useWindowSize';

import { type ILibraryItem } from '../../backend/types';
import { BadgeLocation } from '../../components/BadgeLocation';
import { useLibrarySearchStore } from '../../stores/librarySearch';

const columnHelper = createColumnHelper<ILibraryItem>();

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
                noPadding
                noHover
                className='pl-2 max-h-[1rem] translate-y-[-0.125rem]'
                onClick={handleToggleFolder}
                titleHtml='Переключение в режим Проводник'
                icon={<IconFolderTree size='1.25rem' className='clr-text-controls' />}
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
      cell: props => <div className='min-w-[5rem]'>{props.getValue()}</div>,
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
        <div className='whitespace-nowrap'>
          {new Date(props.getValue()).toLocaleString(intl.locale, {
            year: '2-digit',
            month: '2-digit',
            day: '2-digit',
            ...(!isSmall && {
              hour: '2-digit',
              minute: '2-digit'
            })
          })}
        </div>
      ),
      enableSorting: true,
      sortingFn: 'datetime',
      sortDescFirst: true
    })
  ];
}
