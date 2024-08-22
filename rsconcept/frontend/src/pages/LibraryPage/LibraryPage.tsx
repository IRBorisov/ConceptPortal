'use client';

import { AnimatePresence } from 'framer-motion';
import fileDownload from 'js-file-download';
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import { IconCSV } from '@/components/Icons';
import MiniButton from '@/components/ui/MiniButton';
import Overlay from '@/components/ui/Overlay';
import DataLoader from '@/components/wrap/DataLoader';
import { useAuth } from '@/context/AuthContext';
import { useLibrary } from '@/context/LibraryContext';
import DlgChangeLocation from '@/dialogs/DlgChangeLocation';
import useLocalStorage from '@/hooks/useLocalStorage';
import { ILibraryItem, IRenameLocationData, LocationHead } from '@/models/library';
import { ILibraryFilter } from '@/models/miscellaneous';
import { storage } from '@/utils/constants';
import { information } from '@/utils/labels';
import { convertToCSV, toggleTristateFlag } from '@/utils/utils';

import TableLibraryItems from './TableLibraryItems';
import ToolbarSearch from './ToolbarSearch';
import ViewSideLocation from './ViewSideLocation';

function LibraryPage() {
  const library = useLibrary();
  const { user } = useAuth();
  const [items, setItems] = useState<ILibraryItem[]>([]);

  const [query, setQuery] = useState('');
  const [path, setPath] = useState('');

  const [head, setHead] = useLocalStorage<LocationHead | undefined>(storage.librarySearchHead, undefined);
  const [folderMode, setFolderMode] = useLocalStorage<boolean>(storage.librarySearchFolderMode, true);
  const [subfolders, setSubfolders] = useLocalStorage<boolean>(storage.librarySearchSubfolders, false);
  const [location, setLocation] = useLocalStorage<string>(storage.librarySearchLocation, '');
  const [isVisible, setIsVisible] = useLocalStorage<boolean | undefined>(storage.librarySearchVisible, true);
  const [isOwned, setIsOwned] = useLocalStorage<boolean | undefined>(storage.librarySearchEditor, undefined);
  const [isEditor, setIsEditor] = useLocalStorage<boolean | undefined>(storage.librarySearchEditor, undefined);
  const [showRenameLocation, setShowRenameLocation] = useState(false);

  const filter: ILibraryFilter = useMemo(
    () => ({
      head: head,
      path: path,
      query: query,
      isEditor: user ? isEditor : undefined,
      isOwned: user ? isOwned : undefined,
      isVisible: user ? isVisible : true,
      folderMode: folderMode,
      subfolders: subfolders,
      location: location
    }),
    [head, path, query, isEditor, isOwned, isVisible, user, folderMode, location, subfolders]
  );

  const hasCustomFilter = useMemo(
    () =>
      !!filter.path ||
      !!filter.query ||
      filter.head !== undefined ||
      filter.isEditor !== undefined ||
      filter.isOwned !== undefined ||
      filter.isVisible !== true ||
      !!filter.location,
    [filter]
  );

  useLayoutEffect(() => {
    setItems(library.applyFilter(filter));
  }, [library, library.items.length, filter]);

  const toggleVisible = useCallback(() => setIsVisible(prev => toggleTristateFlag(prev)), [setIsVisible]);
  const toggleOwned = useCallback(() => setIsOwned(prev => toggleTristateFlag(prev)), [setIsOwned]);
  const toggleEditor = useCallback(() => setIsEditor(prev => toggleTristateFlag(prev)), [setIsEditor]);
  const toggleFolderMode = useCallback(() => setFolderMode(prev => !prev), [setFolderMode]);
  const toggleSubfolders = useCallback(() => setSubfolders(prev => !prev), [setSubfolders]);

  const resetFilter = useCallback(() => {
    setQuery('');
    setPath('');
    setHead(undefined);
    setIsVisible(true);
    setIsOwned(undefined);
    setIsEditor(undefined);
    setLocation('');
  }, [setHead, setIsVisible, setIsOwned, setIsEditor, setLocation]);

  const promptRenameLocation = useCallback(() => {
    setShowRenameLocation(true);
  }, []);

  const handleRenameLocation = useCallback(
    (newLocation: string) => {
      const data: IRenameLocationData = {
        target: location,
        new_location: newLocation
      };
      library.renameLocation(data, () => {
        setLocation(newLocation);
        toast.success(information.locationRenamed);
      });
    },
    [location, library]
  );

  const handleDownloadCSV = useCallback(() => {
    if (items.length === 0) {
      toast.error(information.noDataToExport);
      return;
    }
    const blob = convertToCSV(items);
    try {
      fileDownload(blob, 'library.csv', 'text/csv;charset=utf-8;');
    } catch (error) {
      console.error(error);
    }
  }, [items]);

  const viewLibrary = useMemo(
    () => (
      <TableLibraryItems
        resetQuery={resetFilter}
        items={items}
        folderMode={folderMode}
        toggleFolderMode={toggleFolderMode}
      />
    ),
    [resetFilter, items, folderMode, toggleFolderMode]
  );

  const viewLocations = useMemo(
    () => (
      <ViewSideLocation
        active={location}
        setActive={setLocation}
        subfolders={subfolders}
        folderTree={library.folders}
        toggleFolderMode={toggleFolderMode}
        toggleSubfolders={toggleSubfolders}
        onRenameLocation={promptRenameLocation}
      />
    ),
    [location, library.folders, setLocation, toggleFolderMode, subfolders]
  );

  return (
    <DataLoader
      id='library-page' // prettier: split lines
      isLoading={library.loading}
      error={library.loadingError}
      hasNoData={library.items.length === 0}
    >
      {showRenameLocation ? (
        <DlgChangeLocation
          initial={location}
          onChangeLocation={handleRenameLocation}
          hideWindow={() => setShowRenameLocation(false)}
        />
      ) : null}
      <Overlay position='top-[0.25rem] right-0' layer='z-tooltip'>
        <MiniButton
          title='Выгрузить в формате CSV'
          icon={<IconCSV size='1.25rem' className='icon-green' />}
          onClick={handleDownloadCSV}
        />
      </Overlay>
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
        isEditor={isEditor}
        toggleEditor={toggleEditor}
        resetFilter={resetFilter}
        folderMode={folderMode}
        toggleFolderMode={toggleFolderMode}
      />

      <div className='flex'>
        <AnimatePresence initial={false}>{folderMode ? viewLocations : null}</AnimatePresence>
        {viewLibrary}
      </div>
    </DataLoader>
  );
}

export default LibraryPage;
