'use client';

import { AnimatePresence } from 'framer-motion';
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';

import DataLoader from '@/components/wrap/DataLoader';
import { useAuth } from '@/context/AuthContext';
import { useLibrary } from '@/context/LibraryContext';
import useLocalStorage from '@/hooks/useLocalStorage';
import { ILibraryItem, LocationHead } from '@/models/library';
import { ILibraryFilter } from '@/models/miscellaneous';
import { storage } from '@/utils/constants';
import { toggleTristateFlag } from '@/utils/utils';

import TableLibraryItems from './TableLibraryItems';
import ToolbarSearch from './ToolbarSearch';
import ViewSideFolders from './ViewSideFolders';

function LibraryPage() {
  const library = useLibrary();
  const { user } = useAuth();
  const [items, setItems] = useState<ILibraryItem[]>([]);

  const [query, setQuery] = useState('');
  const [path, setPath] = useState('');

  const [head, setHead] = useLocalStorage<LocationHead | undefined>(storage.librarySearchHead, undefined);
  const [folderMode, setFolderMode] = useLocalStorage<boolean>(storage.librarySearchFolderMode, true);
  const [folder, setFolder] = useLocalStorage<string>(storage.librarySearchFolder, '');
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
      isEditor: user ? isEditor : undefined,
      isOwned: user ? isOwned : undefined,
      isSubscribed: user ? isSubscribed : undefined,
      isVisible: user ? isVisible : true,
      folderMode: folderMode,
      folder: folder
    }),
    [head, path, query, isEditor, isOwned, isSubscribed, isVisible, user, folderMode, folder]
  );

  const hasCustomFilter = useMemo(
    () =>
      !!filter.path ||
      !!filter.query ||
      filter.head !== undefined ||
      filter.isEditor !== undefined ||
      filter.isOwned !== undefined ||
      filter.isSubscribed !== undefined ||
      filter.isVisible !== true ||
      !!filter.folder,
    [filter]
  );

  useLayoutEffect(() => {
    setItems(library.applyFilter(filter));
  }, [library, library.items.length, filter]);

  const toggleVisible = useCallback(() => setIsVisible(prev => toggleTristateFlag(prev)), [setIsVisible]);
  const toggleOwned = useCallback(() => setIsOwned(prev => toggleTristateFlag(prev)), [setIsOwned]);
  const toggleSubscribed = useCallback(() => setIsSubscribed(prev => toggleTristateFlag(prev)), [setIsSubscribed]);
  const toggleEditor = useCallback(() => setIsEditor(prev => toggleTristateFlag(prev)), [setIsEditor]);
  const toggleFolderMode = useCallback(() => setFolderMode(prev => !prev), [setFolderMode]);

  const resetFilter = useCallback(() => {
    setQuery('');
    setPath('');
    setHead(undefined);
    setIsVisible(true);
    setIsSubscribed(undefined);
    setIsOwned(undefined);
    setIsEditor(undefined);
    setFolder('');
  }, [setHead, setIsVisible, setIsSubscribed, setIsOwned, setIsEditor, setFolder]);

  const view = useMemo(
    () => (
      <TableLibraryItems
        resetQuery={resetFilter} // prettier: split lines
        items={items}
        folderMode={folderMode}
        toggleFolderMode={toggleFolderMode}
      />
    ),
    [resetFilter, items, folderMode, toggleFolderMode]
  );

  return (
    <DataLoader
      id='library-page' // prettier: split lines
      isLoading={library.loading}
      error={library.loadingError}
      hasNoData={library.items.length === 0}
    >
      <ToolbarSearch
        total={library.items.length ?? 0}
        filtered={items.length}
        hasCustomFilter={hasCustomFilter}
        query={query}
        setQuery={setQuery}
        path={path}
        setPath={setPath}
        head={head}
        setHead={setHead}
        isVisible={isVisible}
        isOwned={isOwned}
        toggleOwned={toggleOwned}
        toggleVisible={toggleVisible}
        isSubscribed={isSubscribed}
        toggleSubscribed={toggleSubscribed}
        isEditor={isEditor}
        toggleEditor={toggleEditor}
        resetFilter={resetFilter}
        folderMode={folderMode}
        toggleFolderMode={toggleFolderMode}
      />

      <div className='flex'>
        <AnimatePresence initial={false}>
          {folderMode ? (
            <ViewSideFolders
              currentFolder={folder} // prettier: split-lines
              setFolder={setFolder}
              folders={library.folders}
              toggleFolderMode={toggleFolderMode}
            />
          ) : null}
        </AnimatePresence>
        {view}
      </div>
    </DataLoader>
  );
}

export default LibraryPage;
