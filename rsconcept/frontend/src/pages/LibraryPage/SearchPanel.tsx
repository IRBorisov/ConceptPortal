import { useCallback, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { MagnifyingGlassIcon } from '../../components/Icons';
import { useAuth } from '../../context/AuthContext';
import { useConceptNavigation } from '../../context/NagivationContext';
import { ILibraryFilter } from '../../models/miscelanious';
import { LibraryFilterStrategy } from '../../models/miscelanious';
import PickerStrategy from './PickerStrategy';


function ApplyStrategy(strategy: LibraryFilterStrategy): ILibraryFilter {
  switch (strategy) {
  case LibraryFilterStrategy.MANUAL: return {};
  case LibraryFilterStrategy.COMMON: return { is_common: true };
  case LibraryFilterStrategy.CANONICAL: return { is_canonical: true };
  case LibraryFilterStrategy.PERSONAL: return { is_personal: true };
  case LibraryFilterStrategy.SUBSCRIBE: return { is_subscribed: true };
  case LibraryFilterStrategy.OWNED: return { is_owned: true };
  }
}

interface SearchPanelProps {
  total: number
  filtered: number
  setFilter: React.Dispatch<React.SetStateAction<ILibraryFilter>>
  query: string
  setQuery: React.Dispatch<React.SetStateAction<string>>
  strategy: LibraryFilterStrategy
  setStrategy: React.Dispatch<React.SetStateAction<LibraryFilterStrategy>>
}

function SearchPanel({ total, filtered, query, setQuery, strategy, setStrategy, setFilter }: SearchPanelProps) {
  const { navigateTo } = useConceptNavigation();
  const search = useLocation().search;
  const { user } = useAuth();

  function handleChangeQuery(event: React.ChangeEvent<HTMLInputElement>) {
    const newQuery = event.target.value;
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
  
  useLayoutEffect(() => {
    const searchFilter = new URLSearchParams(search).get('filter')  as LibraryFilterStrategy | null;
    if (searchFilter === null) {
      navigateTo(`/library?filter=${strategy}`, { replace: true });
      return;
    }
    const inputStrategy = searchFilter && Object.values(LibraryFilterStrategy).includes(searchFilter) ? searchFilter : LibraryFilterStrategy.MANUAL;
    setQuery('')
    setStrategy(inputStrategy)
    setFilter(ApplyStrategy(inputStrategy));
  }, [user, search, setQuery, setFilter, setStrategy, strategy, navigateTo]);

  const handleChangeStrategy = useCallback(
  (value: LibraryFilterStrategy) => {
    if (value === strategy) {
      return;
    }
    navigateTo(`/library?filter=${value}`)
  }, [strategy, navigateTo]);

  return (
    <div className='sticky top-0 left-0 right-0 flex items-stretch justify-start w-full border-b clr-input max-h-[2.3rem]'>
      <div className='px-2 py-1 select-none whitespace-nowrap min-w-[10rem]'>
        Фильтр
        <span className='ml-2'>
          {filtered} из {total}
        </span>
      </div>
      <div className='flex items-center justify-center w-full gap-1'>
        <div className='relative min-w-[10rem] select-none'>
          <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-controls'>
            <MagnifyingGlassIcon />
          </div>
          <input
            type='text'
            value={query}
            className='w-full p-2 pl-10 text-sm outline-none clr-input'
            placeholder='Поиск'
            onChange={handleChangeQuery}
          />
        </div>
        <PickerStrategy
          value={strategy}
          onChange={handleChangeStrategy}
        />
      </div>
    </div>
  );
}

export default SearchPanel;
