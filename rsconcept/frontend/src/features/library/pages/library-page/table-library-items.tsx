'use client';

import { type LibraryItem } from '@/domain/library';
import { LibraryItemType } from '@/domain/library';
import { useTx } from '@/i18n';

import { useConceptNavigation } from '@/app';

import { TextURL } from '@/components/control';
import { DataTable, type IConditionalStyle, type VisibilityState } from '@/components/data-table';
import { useWindowSize } from '@/hooks/use-window-size';
import { useFitHeight } from '@/stores/app-layout';
import { usePreferencesStore } from '@/stores/preferences';
import { type RO } from '@/utils/meta';

import { useLibrarySearchStore } from '../../stores/library-search';

import { useLibraryColumns } from './use-library-columns';

interface TableLibraryItemsProps {
  items: RO<LibraryItem[]>;
}

export function TableLibraryItems({ items }: TableLibraryItemsProps) {
  const tx = useTx();
  const router = useConceptNavigation();
  const { isSmall } = useWindowSize();
  const resetFilter = useLibrarySearchStore(state => state.resetFilter);

  const itemsPerPage = usePreferencesStore(state => state.libraryPagination);
  const setItemsPerPage = usePreferencesStore(state => state.setLibraryPagination);

  const columns = useLibraryColumns();
  const columnVisibility: VisibilityState = { owner: !isSmall };
  const conditionalRowStyles: IConditionalStyle<LibraryItem>[] = [
    {
      when: (item: LibraryItem) => item.item_type === LibraryItemType.OSS,
      className: 'text-accent-green-foreground'
    },
    {
      when: (item: LibraryItem) => item.item_type === LibraryItemType.RSMODEL,
      className: 'text-accent-orange-foreground'
    }
  ];
  const tableHeight = useFitHeight('5rem');

  function handleOpenItem(item: LibraryItem, event: React.MouseEvent<Element>) {
    const selection = window.getSelection();
    if (!!selection && selection.toString().length > 0) {
      return;
    }
    switch (item.item_type) {
      case LibraryItemType.RSFORM:
        router.gotoRSForm(item.id, undefined, event.ctrlKey || event.metaKey);
        break;
      case LibraryItemType.OSS:
        router.gotoOss(item.id, event.ctrlKey || event.metaKey);
        break;
      case LibraryItemType.RSMODEL:
        router.gotoRSModel(item.id, event.ctrlKey || event.metaKey);
        break;
    }
  }

  return (
    <DataTable
      id='library_data'
      columns={columns}
      data={items as LibraryItem[]}
      className='cc-scroll-y h-fit text-xs sm:text-sm'
      style={{ maxHeight: tableHeight }}
      noDataComponent={
        <div className='cc-column dense p-3 items-center min-h-24'>
          <p>{tx('semantic.listIsEmpty')}</p>
          <p className='flex gap-6'>
            <TextURL text={tx('ui.action.createSchema')} href='/library/create' />
            <TextURL text={tx('semantic.action.resetFilter')} onClick={resetFilter} />
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
