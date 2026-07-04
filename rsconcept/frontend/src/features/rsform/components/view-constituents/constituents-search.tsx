'use client';

import { type ReactNode } from 'react';

import { useTx } from '@/i18n';

import { MiniButton } from '@/components/control';
import { IconFilterReset } from '@/components/icons';
import { SearchBar } from '@/components/input';

import { hasActiveCstFilter, useCstSearchStore } from '../../stores/cst-search';

import { SelectorCstFilter } from './selector-cst-filter';

interface ConstituentsSearchProps {
  actions?: ReactNode;
  showModelFilter?: boolean;
  stopSearchKeyPropagation?: boolean;
}

export function ConstituentsSearch({ actions, showModelFilter, stopSearchKeyPropagation }: ConstituentsSearchProps) {
  const tx = useTx();
  const query = useCstSearchStore(state => state.query);
  const setQuery = useCstSearchStore(state => state.setQuery);
  const filter = useCstSearchStore(state => state.filter);

  const hasActiveFilter = hasActiveCstFilter(query, filter);

  function handleReset() {
    useCstSearchStore.getState().reset();
  }

  return (
    <div className='flex items-center border-b bg-input rounded-t-md pl-2 pr-1'>
      <MiniButton
        title={tx('tx.general.filter.reset')}
        icon={<IconFilterReset size='1.25rem' className='icon-primary -mr-1' />}
        onClick={handleReset}
        disabled={!hasActiveFilter}
      />
      <SearchBar
        id='constituents_search'
        noBorder
        className='min-w-24 grow'
        query={query}
        onChangeQuery={setQuery}
        stopKeyPropagation={stopSearchKeyPropagation}
      />
      <SelectorCstFilter showModelFilter={showModelFilter} />
      {actions ? actions : null}
    </div>
  );
}
