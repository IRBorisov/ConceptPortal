'use client';

import { type ReactNode } from 'react';

import { MiniButton } from '@/components/control';
import { IconFilterReset } from '@/components/icons';
import { SearchBar } from '@/components/input';

import { useCstSearchStore } from '../../stores/cst-search';

import { SelectorCstFilter } from './selector-cst-filter';

interface ConstituentsSearchProps {
  actions?: ReactNode;
}

export function ConstituentsSearch({ actions }: ConstituentsSearchProps) {
  const query = useCstSearchStore(state => state.query);
  const setQuery = useCstSearchStore(state => state.setQuery);
  const filter = useCstSearchStore(state => state.filter);

  const hasActiveFilter = filter !== 'all' || query !== '';

  function handleReset() {
    useCstSearchStore.getState().reset();
  }

  return (
    <div className='flex items-center border-b bg-input rounded-t-md pl-2 pr-1'>
      <MiniButton
        title='Сбросить фильтр'
        icon={<IconFilterReset size='1.25rem' className='icon-primary -mr-1' />}
        onClick={handleReset}
        disabled={!hasActiveFilter}
      />
      <SearchBar id='constituents_search' noBorder className='min-w-24 grow' query={query} onChangeQuery={setQuery} />
      <SelectorCstFilter />
      {actions ? actions : null}
    </div>
  );
}
