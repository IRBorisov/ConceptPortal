'use client';

import clsx from 'clsx';
import { useLayoutEffect, useState } from 'react';
import { useIntl } from 'react-intl';

import { urls } from '@/app/urls';
import { IconFolderTree } from '@/components/Icons';
import BadgeLocation from '@/components/info/BadgeLocation';
import { CProps } from '@/components/props';
import DataTable, { createColumnHelper, IConditionalStyle, VisibilityState } from '@/components/ui/DataTable';
import FlexColumn from '@/components/ui/FlexColumn';
import MiniButton from '@/components/ui/MiniButton';
import TextURL from '@/components/ui/TextURL';
import { useConceptNavigation } from '@/context/NavigationContext';
import { useUsers } from '@/context/UsersContext';
import useLocalStorage from '@/hooks/useLocalStorage';
import useWindowSize from '@/hooks/useWindowSize';
import { ILibraryItem, LibraryItemType } from '@/models/library';
import { useFitHeight } from '@/stores/appLayout';
import { APP_COLORS } from '@/styling/color';
import { storage } from '@/utils/constants';

interface TableLibraryItemsProps {
  items: ILibraryItem[];
  resetQuery: () => void;
  folderMode: boolean;
  toggleFolderMode: () => void;
}

const columnHelper = createColumnHelper<ILibraryItem>();

function TableLibraryItems({ items, resetQuery, folderMode, toggleFolderMode }: TableLibraryItemsProps) {
  const router = useConceptNavigation();
  const intl = useIntl();
  const { getUserLabel } = useUsers();
  const [itemsPerPage, setItemsPerPage] = useLocalStorage<number>(storage.libraryPagination, 50);

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
            <TextURL text='Очистить фильтр' onClick={resetQuery} />
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
