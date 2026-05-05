'use client';

import { useTx } from '@/i18n';

import { SelectUser } from '@/features/users/components/select-user';

import { MiniButton } from '@/components/control';
import { IconFilterReset } from '@/components/icons';
import { SearchBar } from '@/components/input';
import { cn } from '@/components/utils';

import { useLibrary } from '../../backend/use-library';
import { useHasCustomFilter, useLibrarySearchStore } from '../../stores/library-search';

import { SelectorLibraryFilter } from './selector-library-filter';

interface ToolbarSearchProps {
  className?: string;
}

export function ToolbarSearch({ className }: ToolbarSearchProps) {
  const tx = useTx();
  const { items } = useLibrary();

  const query = useLibrarySearchStore(state => state.query);
  const setQuery = useLibrarySearchStore(state => state.setQuery);
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
    <div className={cn('flex text-sm items-center pl-1.5', className)}>
      <SelectorLibraryFilter className='mr-1' />

      <MiniButton
        title={tx('semantic.action.resetFilter')}
        icon={<IconFilterReset size='1.25rem' className='icon-primary' />}
        onClick={resetFilter}
        disabled={!hasCustomFilter}
      />

      <SearchBar
        id='library_search'
        placeholder={tx('semantic.term.search')}
        noBorder
        className='min-w-28 sm:min-w-40 max-w-80 grow'
        query={query}
        onChangeQuery={setQuery}
      />
      <SelectUser
        aria-label={tx('lib.search.ownerPlaceholder')}
        placeholder={tx('lib.search.ownerPlaceholder')}
        noBorder
        className='h-7 pr-0 pl-2 max-sm:hidden ml-auto'
        filter={filterNonEmptyUsers}
        value={filterUser}
        onChange={handleSelectUser}
      />
    </div>
  );
}
