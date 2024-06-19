'use client';

import clsx from 'clsx';
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';

import { urls } from '@/app/urls';
import { IconFolder } from '@/components/Icons';
import BadgeLocation from '@/components/info/BadgeLocation';
import { CProps } from '@/components/props';
import DataTable, { createColumnHelper, IConditionalStyle, VisibilityState } from '@/components/ui/DataTable';
import FlexColumn from '@/components/ui/FlexColumn';
import MiniButton from '@/components/ui/MiniButton';
import TextURL from '@/components/ui/TextURL';
import { useConceptNavigation } from '@/context/NavigationContext';
import { useConceptOptions } from '@/context/OptionsContext';
import { useUsers } from '@/context/UsersContext';
import useLocalStorage from '@/hooks/useLocalStorage';
import useWindowSize from '@/hooks/useWindowSize';
import { ILibraryItem, LibraryItemType } from '@/models/library';
import { storage } from '@/utils/constants';

interface LibraryTableProps {
  items: ILibraryItem[];
  resetQuery: () => void;
  folderMode: boolean;
  toggleFolderMode: () => void;
}

const columnHelper = createColumnHelper<ILibraryItem>();

function LibraryTable({ items, resetQuery, folderMode, toggleFolderMode }: LibraryTableProps) {
  const router = useConceptNavigation();
  const intl = useIntl();
  const { getUserLabel } = useUsers();
  const { calculateHeight, colors } = useConceptOptions();
  const [itemsPerPage, setItemsPerPage] = useLocalStorage<number>(storage.libraryPagination, 50);

  function handleOpenItem(item: ILibraryItem, event: CProps.EventMouse) {
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

  const handleToggleFolder = useCallback(
    (event: CProps.EventMouse) => {
      if (event.ctrlKey) {
        event.preventDefault();
        event.stopPropagation();
        toggleFolderMode();
      }
    },
    [toggleFolderMode]
  );

  const columns = useMemo(
    () => [
      ...(folderMode
        ? []
        : [
            columnHelper.accessor('location', {
              id: 'location',
              header: () => (
                <MiniButton
                  noHover
                  noPadding
                  className='pl-2 max-h-[1rem] translate-y-[-0.125rem]'
                  onClick={handleToggleFolder}
                  titleHtml='Ctrl + клик для переключения </br>в режим папок'
                  icon={<IconFolder size='1.25rem' className='clr-text-controls' />}
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
    ],
    [intl, getUserLabel, windowSize, handleToggleFolder, folderMode]
  );

  const tableHeight = useMemo(() => calculateHeight('2.2rem'), [calculateHeight]);

  const conditionalRowStyles = useMemo(
    (): IConditionalStyle<ILibraryItem>[] => [
      {
        when: (item: ILibraryItem) => item.item_type === LibraryItemType.OSS,
        style: {
          backgroundColor: colors.bgGreen50
        }
      }
    ],
    [colors]
  );

  return (
    <DataTable
      id='library_data'
      columns={columns}
      data={items}
      headPosition='0'
      className={clsx('text-xs sm:text-sm cc-scroll-y', { 'border-l border-b': folderMode })}
      style={{ maxHeight: tableHeight }}
      noDataComponent={
        <FlexColumn className='p-3 items-center min-h-[6rem]'>
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

export default LibraryTable;
