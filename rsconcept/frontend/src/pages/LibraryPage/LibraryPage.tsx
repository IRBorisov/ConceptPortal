'use client';

import { useCallback, useLayoutEffect, useState } from 'react';

import DataLoader from '@/components/wrap/DataLoader';
import { useAuth } from '@/context/AuthContext';
import { useLibrary } from '@/context/LibraryContext';
import { useConceptNavigation } from '@/context/NavigationContext';
import { useConceptTheme } from '@/context/ThemeContext';
import useLocalStorage from '@/hooks/useLocalStorage';
import useQueryStrings from '@/hooks/useQueryStrings';
import { ILibraryItem } from '@/models/library';
import { ILibraryFilter, LibraryFilterStrategy } from '@/models/miscellaneous';
import { filterFromStrategy } from '@/models/miscellaneousAPI';
import { storage } from '@/utils/constants';

import SearchPanel from './SearchPanel';
import ViewLibrary from './ViewLibrary';

function LibraryPage() {
  const router = useConceptNavigation();
  const urlParams = useQueryStrings();
  const queryFilter = (urlParams.get('filter') || null) as LibraryFilterStrategy | null;

  const { user } = useAuth();

  const library = useLibrary();
  const { setShowScroll } = useConceptTheme();

  const [filter, setFilter] = useState<ILibraryFilter>({});
  const [items, setItems] = useState<ILibraryItem[]>([]);

  const [query, setQuery] = useState('');
  const [strategy, setStrategy] = useLocalStorage<LibraryFilterStrategy>(
    storage.librarySearchStrategy,
    LibraryFilterStrategy.MANUAL
  );

  useLayoutEffect(() => {
    if (!queryFilter || !Object.values(LibraryFilterStrategy).includes(queryFilter)) {
      router.replace(`/library?filter=${strategy}`);
      return;
    }
    setQuery('');
    setStrategy(queryFilter);
    setFilter(filterFromStrategy(queryFilter));
  }, [user, router, setQuery, setFilter, setStrategy, strategy, queryFilter]);

  useLayoutEffect(() => {
    setShowScroll(true);
    return () => setShowScroll(false);
  }, [setShowScroll]);

  useLayoutEffect(() => {
    setItems(library.applyFilter(filter));
  }, [library, filter, filter.query]);

  const resetQuery = useCallback(() => {
    setQuery('');
    setFilter({});
  }, []);

  return (
    <DataLoader
      id='library-page' //
      isLoading={library.loading}
      error={library.error}
      hasNoData={library.items.length === 0}
    >
      <SearchPanel
        query={query}
        setQuery={setQuery}
        strategy={strategy}
        total={library.items.length ?? 0}
        filtered={items.length}
        setFilter={setFilter}
      />
      <ViewLibrary
        resetQuery={resetQuery} //
        items={items}
      />
    </DataLoader>
  );
}

export default LibraryPage;
