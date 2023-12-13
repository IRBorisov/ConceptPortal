'use client';

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
  <div className='sticky top-0 left-0 right-0 flex items-stretch justify-start w-full border-b clr-input max-h-[2.3rem] pr-40'>
    <div className='px-2 py-1 select-none whitespace-nowrap min-w-[10rem]'>
      Фильтр
      <span className='ml-2'>
        {filtered} из {total}
      </span>
    </div>
    <div className='flex items-center justify-center w-full gap-1'>
      <ConceptSearch noBorder
        value={query}
        onChange={handleChangeQuery}
        dimensions='min-w-[10rem] '
      />
      <PickerStrategy
        value={strategy}
        onChange={handleChangeStrategy}
      />
    </div>
  </div>);
}

export default SearchPanel;