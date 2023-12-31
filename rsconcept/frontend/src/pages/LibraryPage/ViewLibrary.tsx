'use client';

import clsx from 'clsx';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';

import DataTable, { createColumnHelper } from '@/components/DataTable';
import HelpButton from '@/components/Help/HelpButton';
import FlexColumn from '@/components/ui/FlexColumn';
import TextURL from '@/components/ui/TextURL';
import { useAuth } from '@/context/AuthContext';
import { useConceptNavigation } from '@/context/NavigationContext';
import { useUsers } from '@/context/UsersContext';
import useLocalStorage from '@/hooks/useLocalStorage';
import { ILibraryItem } from '@/models/library';
import { HelpTopic } from '@/models/miscellaneous';

import ItemIcons from './ItemIcons';

interface ViewLibraryProps {
  items: ILibraryItem[];
  resetQuery: () => void;
}

const columnHelper = createColumnHelper<ILibraryItem>();

function ViewLibrary({ items, resetQuery: cleanQuery }: ViewLibraryProps) {
  const router = useConceptNavigation();
  const intl = useIntl();
  const { user } = useAuth();
  const { getUserLabel } = useUsers();
  const [itemsPerPage, setItemsPerPage] = useLocalStorage<number>('library_per_page', 50);

  const handleOpenItem = (item: ILibraryItem) => router.push(`/rsforms/${item.id}`);

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'status',
        header: '',
        size: 60,
        minSize: 60,
        maxSize: 60,
        cell: props => <ItemIcons item={props.row.original} user={user} />
      }),
      columnHelper.accessor('alias', {
        id: 'alias',
        header: 'Шифр',
        size: 200,
        minSize: 200,
        maxSize: 200,
        enableSorting: true,
        sortingFn: 'text'
      }),
      columnHelper.accessor('title', {
        id: 'title',
        header: 'Название',
        size: 2000,
        minSize: 400,
        maxSize: 2000,
        enableSorting: true,
        sortingFn: 'text'
      }),
      columnHelper.accessor(item => item.owner ?? 0, {
        id: 'owner',
        header: 'Владелец',
        size: 600,
        minSize: 200,
        maxSize: 600,
        cell: props => getUserLabel(props.cell.getValue()),
        enableSorting: true,
        sortingFn: 'text'
      }),
      columnHelper.accessor('time_update', {
        id: 'time_update',
        header: 'Обновлена',
        cell: props => (
          <div className='text-sm whitespace-nowrap'>{new Date(props.cell.getValue()).toLocaleString(intl.locale)}</div>
        ),
        enableSorting: true,
        sortingFn: 'datetime',
        sortDescFirst: true
      })
    ],
    [intl, getUserLabel, user]
  );

  return (
    <>
      <div className='sticky top-[2.3rem] w-full'>
        <div
          className={clsx(
            'z-pop', // prettier: split lines
            'absolute top-[0.125rem] left-[0.25rem]',
            'ml-3',
            'flex gap-1'
          )}
        >
          <HelpButton topic={HelpTopic.LIBRARY} className='max-w-[35rem]' offset={5} place='right-start' />
        </div>
      </div>
      <DataTable
        columns={columns}
        data={items}
        headPosition='2.3rem'
        noDataComponent={
          <FlexColumn className='p-3 items-center min-h-[6rem]'>
            <p>Список схем пуст</p>
            <p className='flex gap-6'>
              <TextURL text='Создать схему' href='/library/create' />
              <TextURL text='Очистить фильтр' onClick={cleanQuery} />
            </p>
          </FlexColumn>
        }
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
    </>
  );
}

export default ViewLibrary;
