'use client';

import { useCallback, useLayoutEffect, useState } from 'react';

import { ConceptLoader } from '@/components/Common/ConceptLoader';
import InfoError from '@/components/InfoError';
import { useAuth } from '@/context/AuthContext';
import { useLibrary } from '@/context/LibraryContext';
import { useConceptNavigation } from '@/context/NavigationContext';
import { useConceptTheme } from '@/context/ThemeContext';
import useLocalStorage from '@/hooks/useLocalStorage';
import useQueryStrings from '@/hooks/useQueryStrings';
import { ILibraryItem } from '@/models/library';
import { ILibraryFilter, LibraryFilterStrategy } from '@/models/miscellaneous';

import SearchPanel from './SearchPanel';
import ViewLibrary from './ViewLibrary';

function LibraryPage() {
  const router = useConceptNavigation();
  const urlParams = useQueryStrings();
  const searchFilter = (urlParams.get('filter') || null) as LibraryFilterStrategy | null;

  const { user } = useAuth();

  const library = useLibrary();
  const { setShowScroll } = useConceptTheme();

  const [filter, setFilter] = useState<ILibraryFilter>({});
  const [items, setItems] = useState<ILibraryItem[]>([]);

  const [query, setQuery] = useState('');
  const [strategy, setStrategy] = useLocalStorage<LibraryFilterStrategy>(
    'search_strategy',
    LibraryFilterStrategy.MANUAL
  );

  useLayoutEffect(() => {
    if (searchFilter === null) {
      router.replace(`/library?filter=${strategy}`);
      return;
    }
    const inputStrategy =
      searchFilter && Object.values(LibraryFilterStrategy).includes(searchFilter)
        ? searchFilter
        : LibraryFilterStrategy.MANUAL;
    setQuery('');
    setStrategy(inputStrategy);
    setFilter(ApplyStrategy(inputStrategy));
  }, [user, router, setQuery, setFilter, setStrategy, strategy, searchFilter]);

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
    <>
      {library.loading ? <ConceptLoader /> : null}
      {library.error ? <InfoError error={library.error} /> : null}
      {!library.loading && library.items ? (
        <>
          <SearchPanel
            query={query}
            setQuery={setQuery}
            strategy={strategy}
            total={library.items.length ?? 0}
            filtered={items.length}
            setFilter={setFilter}
          />
          <ViewLibrary resetQuery={resetQuery} items={items} />
        </>
      ) : null}
    </>
  );
}

export default LibraryPage;

// ====== Internals =======
function ApplyStrategy(strategy: LibraryFilterStrategy): ILibraryFilter {
  // prettier-ignore
  switch (strategy) {
    case LibraryFilterStrategy.MANUAL: return {};
    case LibraryFilterStrategy.COMMON: return { is_common: true };
    case LibraryFilterStrategy.CANONICAL: return { is_canonical: true };
    case LibraryFilterStrategy.PERSONAL: return { is_personal: true };
    case LibraryFilterStrategy.SUBSCRIBE: return { is_subscribed: true };
    case LibraryFilterStrategy.OWNED: return { is_owned: true };
  }
}
