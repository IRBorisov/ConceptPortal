'use client';

import { useLayoutEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';

import { urls } from '@/app/urls';
import { CProps } from '@/components/props';
import DataTable, { createColumnHelper, VisibilityState } from '@/components/ui/DataTable';
import FlexColumn from '@/components/ui/FlexColumn';
import TextURL from '@/components/ui/TextURL';
import { useConceptNavigation } from '@/context/NavigationContext';
import { useConceptOptions } from '@/context/OptionsContext';
import { useUsers } from '@/context/UsersContext';
import useLocalStorage from '@/hooks/useLocalStorage';
import useWindowSize from '@/hooks/useWindowSize';
import { ILibraryItem } from '@/models/library';
import { storage } from '@/utils/constants';

interface ViewLibraryProps {
  items: ILibraryItem[];
  resetQuery: () => void;
}

const columnHelper = createColumnHelper<ILibraryItem>();

function ViewLibrary({ items, resetQuery }: ViewLibraryProps) {
  const router = useConceptNavigation();
  const intl = useIntl();
  const { getUserLabel } = useUsers();
  const { calculateHeight } = useConceptOptions();
  const [itemsPerPage, setItemsPerPage] = useLocalStorage<number>(storage.libraryPagination, 50);

  function handleOpenItem(item: ILibraryItem, event: CProps.EventMouse) {
    router.push(urls.schema(item.id), event.ctrlKey || event.metaKey);
  }

  const windowSize = useWindowSize();

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  useLayoutEffect(() => {
    setColumnVisibility({
      owner: !windowSize.isSmall
    });
  }, [windowSize]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('alias', {
        id: 'alias',
        header: 'Шифр',
        size: 150,
        minSize: 80,
        maxSize: 150,
        enableSorting: true,
        cell: props => <div className='pl-2'>{props.getValue()}</div>,
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
    [intl, getUserLabel, windowSize]
  );

  const tableHeight = useMemo(() => calculateHeight('2.2rem'), [calculateHeight]);

  return (
    <DataTable
      id='library_data'
      columns={columns}
      data={items}
      headPosition='0'
      className='text-xs sm:text-sm cc-scroll-y'
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
    />
  );
}

export default ViewLibrary;
