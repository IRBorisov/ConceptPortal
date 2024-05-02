'use client';

import { useCallback, useLayoutEffect, useMemo, useState } from 'react';

import { urls } from '@/app/urls';
import DataLoader from '@/components/wrap/DataLoader';
import { useAuth } from '@/context/AuthContext';
import { useLibrary } from '@/context/LibraryContext';
import { useConceptNavigation } from '@/context/NavigationContext';
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

  const [filter, setFilter] = useState<ILibraryFilter>({});
  const [items, setItems] = useState<ILibraryItem[]>([]);

  const [query, setQuery] = useState('');
  const [strategy, setStrategy] = useLocalStorage<LibraryFilterStrategy>(
    storage.librarySearchStrategy,
    LibraryFilterStrategy.MANUAL
  );

  useLayoutEffect(() => {
    if (!queryFilter || !Object.values(LibraryFilterStrategy).includes(queryFilter)) {
      router.replace(urls.library_filter(strategy));
      return;
    }
    setQuery('');
    setStrategy(queryFilter);
    setFilter(filterFromStrategy(queryFilter));
  }, [user, router, setQuery, setFilter, setStrategy, strategy, queryFilter]);

  useLayoutEffect(() => {
    setItems(library.applyFilter(filter));
  }, [library, filter, filter.query]);

  const resetQuery = useCallback(() => {
    setQuery('');
    setFilter({});
  }, []);

  const view = useMemo(
    () => (
      <ViewLibrary
        resetQuery={resetQuery} //
        items={items}
      />
    ),
    [resetQuery, items]
  );

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
      {view}
    </DataLoader>
  );
}

export default LibraryPage;
