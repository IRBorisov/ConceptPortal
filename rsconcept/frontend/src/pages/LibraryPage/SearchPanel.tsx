'use client';

import clsx from 'clsx';
import { useCallback } from 'react';

import ConceptSearch from '@/components/Common/ConceptSearch';
import { useConceptNavigation } from '@/context/NagivationContext';
import { ILibraryFilter } from '@/models/miscelanious';
import { LibraryFilterStrategy } from '@/models/miscelanious';

import PickerStrategy from './PickerStrategy';

interface SearchPanelProps {
  total: number
  filtered: number
  setFilter: React.Dispatch<React.SetStateAction<ILibraryFilter>>
  query: string
  setQuery: React.Dispatch<React.SetStateAction<string>>
  strategy: LibraryFilterStrategy
}

function SearchPanel({ total, filtered, query, setQuery, strategy, setFilter }: SearchPanelProps) {
  const router = useConceptNavigation();

  function handleChangeQuery(newQuery: string) {
    setQuery(newQuery);
    setFilter(prev => ({
      query: newQuery,
      is_owned: prev.is_owned,
      is_common: prev.is_common,
      is_canonical: prev.is_canonical,
      is_subscribed: prev.is_subscribed,
      is_personal: prev.is_personal
    }));
  }

  const handleChangeStrategy = useCallback(
  (value: LibraryFilterStrategy) => {
    if (value !== strategy) {
      router.push(`/library?filter=${value}`);
    }
  }, [strategy, router]);

  return (
  <div className={clsx(
    'sticky top-0',
    'w-full max-h-[2.3rem]',
    'pr-40 flex justify-start items-stretch',
    'border-b',
    'clr-input'
  )}>
    <div className={clsx(
      'min-w-[10rem]',
      'px-2 self-center',
      'select-none',
      'whitespace-nowrap', 
    )}>
      Фильтр
      <span className='ml-2'>
        {filtered} из {total}
      </span>
    </div>
    <div className={clsx(
      'w-full',
      'flex gap-1 justify-center items-center'
    )}>
      <ConceptSearch noBorder
        dimensions='min-w-[10rem]'
        value={query}
        onChange={handleChangeQuery}
      />
      <PickerStrategy
        value={strategy}
        onChange={handleChangeStrategy}
      />
    </div>
  </div>);
}

export default SearchPanel;