'use client';

import { useCallback, useLayoutEffect, useMemo, useState } from 'react';

import DataLoader from '@/components/wrap/DataLoader';
import { useLibrary } from '@/context/LibraryContext';
import useLocalStorage from '@/hooks/useLocalStorage';
import { ILibraryItem, LocationHead } from '@/models/library';
import { ILibraryFilter } from '@/models/miscellaneous';
import { storage } from '@/utils/constants';
import { toggleTristateFlag } from '@/utils/utils';

import LibraryTable from './LibraryTable';
import SearchPanel from './SearchPanel';

function LibraryPage() {
  const library = useLibrary();
  const [items, setItems] = useState<ILibraryItem[]>([]);

  const [query, setQuery] = useState('');
  const [path, setPath] = useState('');

  const [head, setHead] = useLocalStorage<LocationHead | undefined>(storage.librarySearchHead, undefined);
  const [isVisible, setIsVisible] = useLocalStorage<boolean | undefined>(storage.librarySearchVisible, true);
  const [isSubscribed, setIsSubscribed] = useLocalStorage<boolean | undefined>(
    storage.librarySearchSubscribed,
    undefined
  );
  const [isOwned, setIsOwned] = useLocalStorage<boolean | undefined>(storage.librarySearchEditor, undefined);
  const [isEditor, setIsEditor] = useLocalStorage<boolean | undefined>(storage.librarySearchEditor, undefined);

  const filter: ILibraryFilter = useMemo(
    () => ({
      head: head,
      path: path,
      query: query,
      isEditor: isEditor,
      isOwned: isOwned,
      isSubscribed: isSubscribed,
      isVisible: isVisible
    }),
    [head, path, query, isEditor, isOwned, isSubscribed, isVisible]
  );

  useLayoutEffect(() => {
    setItems(library.applyFilter(filter));
  }, [library, filter, filter.query]);

  const toggleVisible = useCallback(() => setIsVisible(prev => toggleTristateFlag(prev)), [setIsVisible]);
  const toggleOwned = useCallback(() => setIsOwned(prev => toggleTristateFlag(prev)), [setIsOwned]);
  const toggleSubscribed = useCallback(() => setIsSubscribed(prev => toggleTristateFlag(prev)), [setIsSubscribed]);
  const toggleEditor = useCallback(() => setIsEditor(prev => toggleTristateFlag(prev)), [setIsEditor]);

  const resetFilter = useCallback(() => {
    setQuery('');
    setPath('');
    setHead(undefined);
    setIsVisible(true);
    setIsSubscribed(undefined);
    setIsOwned(undefined);
    setIsEditor(undefined);
  }, [setHead, setIsVisible, setIsSubscribed, setIsOwned, setIsEditor]);

  const view = useMemo(
    () => (
      <LibraryTable
        resetQuery={resetFilter} // prettier: split lines
        items={items}
      />
    ),
    [resetFilter, items]
  );

  return (
    <DataLoader
      id='library-page' // prettier: split lines
      isLoading={library.loading}
      error={library.error}
      hasNoData={library.items.length === 0}
    >
      <SearchPanel
        query={query}
        setQuery={setQuery}
        path={path}
        setPath={setPath}
        head={head}
        setHead={setHead}
        total={library.items.length ?? 0}
        filtered={items.length}
        isVisible={isVisible}
        isOwned={isOwned}
        toggleOwned={toggleOwned}
        toggleVisible={toggleVisible}
        isSubscribed={isSubscribed}
        toggleSubscribed={toggleSubscribed}
        isEditor={isEditor}
        toggleEditor={toggleEditor}
      />
      {view}
    </DataLoader>
  );
}

export default LibraryPage;
