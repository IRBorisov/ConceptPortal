'use client';

import clsx from 'clsx';

import { SelectUser } from '@/features/users/components/select-user';

import { MiniButton } from '@/components/control';
import { IconFilterReset } from '@/components/icons';
import { SearchBar } from '@/components/input';
import { cn } from '@/components/utils';

import { useLibrary } from '../../backend/use-library';
import { IconShowSidebar } from '../../components/icon-show-sidebar';
import { useHasCustomFilter, useLibrarySearchStore } from '../../stores/library-search';

import { SelectorLibraryFilter } from './selector-library-filter';

interface ToolbarSearchProps {
  className?: string;
  total: number;
  filtered: number;
}

export function ToolbarSearch({ className, total, filtered }: ToolbarSearchProps) {
  const { items } = useLibrary();

  const query = useLibrarySearchStore(state => state.query);
  const setQuery = useLibrarySearchStore(state => state.setQuery);
  const folderMode = useLibrarySearchStore(state => state.folderMode);
  const toggleFolderMode = useLibrarySearchStore(state => state.toggleFolderMode);
  const filterUser = useLibrarySearchStore(state => state.filterUser);
  const setFilterUser = useLibrarySearchStore(state => state.setFilterUser);

  const resetFilter = useLibrarySearchStore(state => state.resetFilter);
  const hasCustomFilter = useHasCustomFilter();

  function filterNonEmptyUsers(userID: number): boolean {
    return items.some(item => item.owner === userID);
  }

  function handleSelectUser(userID: number | null) {
    setFilterUser(userID);
  }

  return (
    <div className={cn('flex gap-3 border-b text-sm bg-input items-center pl-4 pr-3', className)}>
      <MiniButton
        title='Отображение проводника'
        icon={<IconShowSidebar value={!folderMode} size='1.25rem' />}
        onClick={toggleFolderMode}
      />
      <div className='min-w-17 sm:min-w-21 select-none whitespace-nowrap -mr-2'>
        {filtered} из {total}
      </div>

      <div className='cc-icons h-full items-center'>
        <SelectorLibraryFilter />

        <MiniButton
          title='Сбросить фильтры'
          icon={<IconFilterReset size='1.25rem' className='icon-primary' />}
          onClick={resetFilter}
          disabled={!hasCustomFilter}
        />
      </div>

      <div className='flex justify-between items-center h-full grow sm:pr-8'>
        <SearchBar
          id='library_search'
          placeholder='Поиск'
          noBorder
          className={clsx('min-w-28 sm:min-w-40 max-w-80', folderMode && 'grow')}
          query={query}
          onChangeQuery={setQuery}
        />
        <SelectUser
          aria-label='Поиск по владельцу'
          placeholder='Поиск по владельцу'
          noBorder
          className='mr-2 h-7 pr-0 pl-2'
          filter={filterNonEmptyUsers}
          value={filterUser}
          onChange={handleSelectUser}
        />
      </div>
    </div>
  );
}
