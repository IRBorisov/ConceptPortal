'use client';

import clsx from 'clsx';
import { useCallback } from 'react';

import { urls } from '@/app/urls';
import SearchBar from '@/components/ui/SearchBar';
import { useConceptNavigation } from '@/context/NavigationContext';
import { ILibraryFilter } from '@/models/miscellaneous';
import { LibraryFilterStrategy } from '@/models/miscellaneous';

import PickerStrategy from './PickerStrategy';

interface SearchPanelProps {
  total: number;
  filtered: number;
  setFilter: React.Dispatch<React.SetStateAction<ILibraryFilter>>;
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  strategy: LibraryFilterStrategy;
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
        router.push(urls.library_filter(value));
      }
    },
    [strategy, router]
  );

  return (
    <div
      className={clsx(
        'sticky top-0', // prettier: split lines
        'w-full h-[2.2rem]',
        'sm:pr-[12rem] flex',
        'border-b',
        'text-sm',
        'clr-input'
      )}
    >
      <div
        className={clsx(
          'min-w-[10rem]', // prettier: split lines
          'px-2 self-center',
          'select-none',
          'whitespace-nowrap'
        )}
      >
        Фильтр
        <span className='ml-2'>
          {filtered} из {total}
        </span>
      </div>
      <PickerStrategy value={strategy} onChange={handleChangeStrategy} />
      <SearchBar
        id='library_search'
        noBorder
        className='mx-auto min-w-[10rem]'
        value={query}
        onChange={handleChangeQuery}
      />
    </div>
  );
}

export default SearchPanel;
