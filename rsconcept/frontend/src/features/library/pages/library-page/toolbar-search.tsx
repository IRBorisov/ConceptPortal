'use client';

import { useTx } from '@/i18n';

import { SelectUser } from '@/features/users/components/select-user';

import { MiniButton } from '@/components/control';
import { IconFilterReset } from '@/components/icons';
import { SearchBar } from '@/components/input';
import { cn } from '@/components/utils';

import { useLibrary } from '../../backend/use-library';
import { useLibraryContextSearch } from '../../backend/use-library-context-search';
import { useHasCustomFilter, useLibrarySearchStore } from '../../stores/library-search';

import { PopoverContextFields } from './popover-context-fields';
import { SelectorLibraryFilter } from './selector-library-filter';
import { SelectorSearchMode } from './selector-search-mode';

interface ToolbarSearchProps {
  className?: string;
}

export function ToolbarSearch({ className }: ToolbarSearchProps) {
  const tx = useTx();
  const { items } = useLibrary();

  const query = useLibrarySearchStore(state => state.query);
  const setQuery = useLibrarySearchStore(state => state.setQuery);
  const searchMode = useLibrarySearchStore(state => state.searchMode);
  const contextFields = useLibrarySearchStore(state => state.contextFields);
  const filterUser = useLibrarySearchStore(state => state.filterUser);
  const { isPending: contextSearchPending } = useLibraryContextSearch({
    query,
    contextFields,
    enabled: searchMode === 'context'
  });
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
    <div className={cn('flex text-sm items-center pl-1.5', className)} data-tour='library-search'>
      <SelectorLibraryFilter className='mr-1' />
      <SelectorSearchMode className='mr-1 max-sm:hidden' />
      {searchMode === 'context' ? <PopoverContextFields className='mr-1 max-sm:hidden' /> : null}

      <MiniButton
        title={tx('tx.general.filter.reset')}
        icon={<IconFilterReset size='1.25rem' className='icon-primary' />}
        onClick={resetFilter}
        disabled={!hasCustomFilter}
      />

      <SearchBar
        id='library_search'
        placeholder={tx('tx.general.search')}
        noBorder
        loading={contextSearchPending}
        className='min-w-28 sm:min-w-40 max-w-80 grow'
        query={query}
        onChangeQuery={setQuery}
      />
      <SelectUser
        aria-label={tx('tx.lib.search.byOwner')}
        placeholder={tx('tx.lib.search.byOwner')}
        noBorder
        className='h-7 pr-0 pl-2 max-sm:hidden ml-auto'
        filter={filterNonEmptyUsers}
        value={filterUser}
        onChange={handleSelectUser}
      />
    </div>
  );
}
