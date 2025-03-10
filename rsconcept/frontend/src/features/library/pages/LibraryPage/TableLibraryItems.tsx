'use client';

import clsx from 'clsx';

import { urls, useConceptNavigation } from '@/app';

import { TextURL } from '@/components/Control';
import { DataTable, type IConditionalStyle, type VisibilityState } from '@/components/DataTable';
import { useWindowSize } from '@/hooks/useWindowSize';
import { useFitHeight } from '@/stores/appLayout';
import { usePreferencesStore } from '@/stores/preferences';
import { APP_COLORS } from '@/styling/colors';

import { type ILibraryItem, LibraryItemType } from '../../backend/types';
import { useLibrarySearchStore } from '../../stores/librarySearch';

import { useLibraryColumns } from './useLibraryColumns';

interface TableLibraryItemsProps {
  items: ILibraryItem[];
}

export function TableLibraryItems({ items }: TableLibraryItemsProps) {
  const router = useConceptNavigation();
  const { isSmall } = useWindowSize();

  const folderMode = useLibrarySearchStore(state => state.folderMode);
  const resetFilter = useLibrarySearchStore(state => state.resetFilter);

  const itemsPerPage = usePreferencesStore(state => state.libraryPagination);
  const setItemsPerPage = usePreferencesStore(state => state.setLibraryPagination);

  const columns = useLibraryColumns();
  const columnVisibility: VisibilityState = { owner: !isSmall };
  const conditionalRowStyles: IConditionalStyle<ILibraryItem>[] = [
    {
      when: (item: ILibraryItem) => item.item_type === LibraryItemType.OSS,
      style: {
        color: APP_COLORS.fgGreen
      }
    }
  ];
  const tableHeight = useFitHeight('2.25rem');

  function handleOpenItem(item: ILibraryItem, event: React.MouseEvent<Element>) {
    const selection = window.getSelection();
    if (!!selection && selection.toString().length > 0) {
      return;
    }
    if (item.item_type === LibraryItemType.RSFORM) {
      router.push({ path: urls.schema(item.id), newTab: event.ctrlKey || event.metaKey });
    } else if (item.item_type === LibraryItemType.OSS) {
      router.push({ path: urls.oss(item.id), newTab: event.ctrlKey || event.metaKey });
    }
  }

  return (
    <DataTable
      id='library_data'
      columns={columns}
      data={items}
      headPosition='0'
      className={clsx('text-xs sm:text-sm cc-scroll-y h-fit border-b', { 'border-l': folderMode })}
      style={{ maxHeight: tableHeight }}
      noDataComponent={
        <div className='cc-column dense p-3 items-center min-h-24'>
          <p>Список схем пуст</p>
          <p className='flex gap-6'>
            <TextURL text='Создать схему' href='/library/create' />
            <TextURL text='Очистить фильтр' onClick={resetFilter} />
          </p>
        </div>
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
