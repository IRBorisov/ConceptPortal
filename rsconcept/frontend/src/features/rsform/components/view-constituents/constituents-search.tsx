'use client';

import { type ReactNode } from 'react';

import { useTx } from '@/i18n';

import { MiniButton } from '@/components/control';
import { IconFilterReset } from '@/components/icons';
import { SearchBar } from '@/components/input';
import { cn } from '@/components/utils';

import { hasActiveCstFilter, useCstSearchStore } from '../../stores/cst-search';

import { SelectorCstFilter } from './selector-cst-filter';

interface ConstituentsSearchProps {
  id?: string;
  actions?: ReactNode;
  showModelFilter?: boolean;
  stopSearchKeyPropagation?: boolean;
  compact?: boolean;
}

export function ConstituentsSearch({
  id,
  actions,
  showModelFilter,
  stopSearchKeyPropagation,
  compact
}: ConstituentsSearchProps) {
  const tx = useTx();
  const query = useCstSearchStore(state => state.query);
  const setQuery = useCstSearchStore(state => state.setQuery);
  const filter = useCstSearchStore(state => state.filter);

  const hasActiveFilter = hasActiveCstFilter(query, filter);

  function handleReset() {
    useCstSearchStore.getState().reset();
  }

  return (
    <div
      className={cn(
        'flex items-center bg-input pl-2 pr-1',
        compact ? 'h-8 max-w-70 shrink-0 border rounded-md overflow-hidden' : 'border-b rounded-t-md'
      )}
    >
      <MiniButton
        title={tx('tx.general.filter.reset')}
        icon={<IconFilterReset size='1.25rem' className='icon-primary -mr-1' />}
        onClick={handleReset}
        disabled={!hasActiveFilter}
        className={compact ? 'shrink-0' : undefined}
      />
      <SearchBar
        id={id}
        noBorder
        className={cn(compact ? 'min-w-0 w-28' : 'min-w-24 grow')}
        query={query}
        onChangeQuery={setQuery}
        stopKeyPropagation={stopSearchKeyPropagation}
      />
      <SelectorCstFilter showModelFilter={showModelFilter} className={compact ? 'shrink-0' : undefined} />
      {actions ? actions : null}
    </div>
  );
}
