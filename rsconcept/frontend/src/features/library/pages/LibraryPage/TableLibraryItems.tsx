'use client';

import clsx from 'clsx';
import { useLayoutEffect, useState } from 'react';
import { useIntl } from 'react-intl';

import { urls, useConceptNavigation } from '@/app';
import { FlexColumn } from '@/components/Container';
import { MiniButton, TextURL } from '@/components/Control';
import DataTable, { createColumnHelper, IConditionalStyle, VisibilityState } from '@/components/DataTable';
import { IconFolderTree } from '@/components/Icons';
import { CProps } from '@/components/props';
import { useLabelUser } from '@/features/users';
import useWindowSize from '@/hooks/useWindowSize';
import { useFitHeight } from '@/stores/appLayout';
import { usePreferencesStore } from '@/stores/preferences';
import { APP_COLORS } from '@/styling/colors';

import BadgeLocation from '../../components/BadgeLocation';
import { ILibraryItem, LibraryItemType } from '../../models/library';
import { useLibrarySearchStore } from '../../stores/librarySearch';

interface TableLibraryItemsProps {
  items: ILibraryItem[];
}

const columnHelper = createColumnHelper<ILibraryItem>();

function TableLibraryItems({ items }: TableLibraryItemsProps) {
  const router = useConceptNavigation();
  const intl = useIntl();
  const getUserLabel = useLabelUser();

  const folderMode = useLibrarySearchStore(state => state.folderMode);
  const toggleFolderMode = useLibrarySearchStore(state => state.toggleFolderMode);
  const resetFilter = useLibrarySearchStore(state => state.resetFilter);

  const itemsPerPage = usePreferencesStore(state => state.libraryPagination);
  const setItemsPerPage = usePreferencesStore(state => state.setLibraryPagination);

  function handleOpenItem(item: ILibraryItem, event: CProps.EventMouse) {
    const selection = window.getSelection();
    if (!!selection && selection.toString().length > 0) {
      return;
    }
    if (item.item_type === LibraryItemType.RSFORM) {
      router.push(urls.schema(item.id), event.ctrlKey || event.metaKey);
    } else if (item.item_type === LibraryItemType.OSS) {
      router.push(urls.oss(item.id), event.ctrlKey || event.metaKey);
    }
  }

  const windowSize = useWindowSize();

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  useLayoutEffect(() => {
    setColumnVisibility({
      owner: !windowSize.isSmall
    });
  }, [windowSize]);

  function handleToggleFolder(event: CProps.EventMouse) {
    event.preventDefault();
    event.stopPropagation();
    toggleFolderMode();
  }

  const columns = [
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
      header: windowSize.isSmall ? 'Дата' : 'Обновлена',
      cell: props => (
        <div className='whitespace-nowrap'>
          {new Date(props.getValue()).toLocaleString(intl.locale, {
            year: '2-digit',
            month: '2-digit',
            day: '2-digit',
            ...(!windowSize.isSmall && {
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

  const tableHeight = useFitHeight('2.2rem');

  const conditionalRowStyles: IConditionalStyle<ILibraryItem>[] = [
    {
      when: (item: ILibraryItem) => item.item_type === LibraryItemType.OSS,
      style: {
        color: APP_COLORS.fgGreen
      }
    }
  ];

  return (
    <DataTable
      id='library_data'
      columns={columns}
      data={items}
      headPosition='0'
      className={clsx('text-xs sm:text-sm cc-scroll-y h-fit border-b', { 'border-l': folderMode })}
      style={{ maxHeight: tableHeight }}
      noDataComponent={
        <FlexColumn className='dense p-3 items-center min-h-[6rem]'>
          <p>Список схем пуст</p>
          <p className='flex gap-6'>
            <TextURL text='Создать схему' href='/library/create' />
            <TextURL text='Очистить фильтр' onClick={resetFilter} />
          </p>
        </FlexColumn>
      }
      columnVisibility={columnVisibility}
      onRowClicked={handleOpenItem}
      enableSorting
      initialSorting={{
        id: 'time_update',
        desc: true
      }}
      enablePagination
      paginationPerPage={itemsPerPage}
      onChangePaginationOption={setItemsPerPage}
      paginationOptions={[10, 20, 30, 50, 100]}
      conditionalRowStyles={conditionalRowStyles}
    />
  );
}

export default TableLibraryItems;
