'use client';

import clsx from 'clsx';

import { urls, useConceptNavigation } from '@/app';

import { TextURL } from '@/components/control';
import { DataTable, type IConditionalStyle, type VisibilityState } from '@/components/data-table';
import { useWindowSize } from '@/hooks/use-window-size';
import { useFitHeight } from '@/stores/app-layout';
import { usePreferencesStore } from '@/stores/preferences';
import { type RO } from '@/utils/meta';

import { type ILibraryItem, LibraryItemType } from '../../backend/types';
import { useLibrarySearchStore } from '../../stores/library-search';

import { useLibraryColumns } from './use-library-columns';

interface TableLibraryItemsProps {
  items: RO<ILibraryItem[]>;
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
      className: 'text-accent-green-foreground'
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
      data={items as ILibraryItem[]}
      headPosition='0'
      className={clsx('cc-scroll-y h-fit text-xs sm:text-sm border-b', folderMode && 'border-l')}
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
