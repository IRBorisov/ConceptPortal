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
import { useConceptOptions } from '@/context/ConceptOptionsContext';
import { useLibrary } from '@/context/LibraryContext';
import DlgChangeLocation from '@/dialogs/DlgChangeLocation';
import useLocalStorage from '@/hooks/useLocalStorage';
import { ILibraryItem, IRenameLocationData, LocationHead } from '@/models/library';
import { ILibraryFilter } from '@/models/miscellaneous';
import { UserID } from '@/models/user';
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
  const options = useConceptOptions();

  const [query, setQuery] = useState('');
  const [path, setPath] = useState('');

  const [head, setHead] = useLocalStorage<LocationHead | undefined>(storage.librarySearchHead, undefined);
  const [subfolders, setSubfolders] = useLocalStorage<boolean>(storage.librarySearchSubfolders, false);
  const [isVisible, setIsVisible] = useLocalStorage<boolean | undefined>(storage.librarySearchVisible, true);
  const [isOwned, setIsOwned] = useLocalStorage<boolean | undefined>(storage.librarySearchOwned, undefined);
  const [isEditor, setIsEditor] = useLocalStorage<boolean | undefined>(storage.librarySearchEditor, undefined);
  const [filterUser, setFilterUser] = useLocalStorage<UserID | undefined>(storage.librarySearchUser, undefined);
  const [showRenameLocation, setShowRenameLocation] = useState(false);

  const filter: ILibraryFilter = useMemo(
    () => ({
      head: head,
      path: path,
      query: query,
      isEditor: user ? isEditor : undefined,
      isOwned: user ? isOwned : undefined,
      isVisible: user ? isVisible : true,
      folderMode: options.folderMode,
      subfolders: subfolders,
      location: options.location,
      filterUser: filterUser
    }),
    [
      head,
      path,
      query,
      isEditor,
      isOwned,
      isVisible,
      user,
      options.folderMode,
      options.location,
      subfolders,
      filterUser
    ]
  );

  const hasCustomFilter = useMemo(
    () =>
      !!filter.path ||
      !!filter.query ||
      filter.head !== undefined ||
      filter.isEditor !== undefined ||
      filter.isOwned !== undefined ||
      filter.isVisible !== true ||
      filter.filterUser !== undefined ||
      !!filter.location,
    [filter]
  );

  useLayoutEffect(() => {
    setItems(library.applyFilter(filter));
  }, [library, library.items.length, filter]);

  const toggleVisible = useCallback(() => setIsVisible(prev => toggleTristateFlag(prev)), [setIsVisible]);
  const toggleOwned = useCallback(() => setIsOwned(prev => toggleTristateFlag(prev)), [setIsOwned]);
  const toggleEditor = useCallback(() => setIsEditor(prev => toggleTristateFlag(prev)), [setIsEditor]);
  const toggleFolderMode = useCallback(() => options.setFolderMode(prev => !prev), [options]);
  const toggleSubfolders = useCallback(() => setSubfolders(prev => !prev), [setSubfolders]);

  const resetFilter = useCallback(() => {
    setQuery('');
    setPath('');
    setHead(undefined);
    setIsVisible(true);
    setIsOwned(undefined);
    setIsEditor(undefined);
    setFilterUser(undefined);
    options.setLocation('');
  }, [setHead, setIsVisible, setIsOwned, setIsEditor, setFilterUser, options]);

  const promptRenameLocation = useCallback(() => {
    setShowRenameLocation(true);
  }, []);

  const handleRenameLocation = useCallback(
    (newLocation: string) => {
      const data: IRenameLocationData = {
        target: options.location,
        new_location: newLocation
      };
      library.renameLocation(data, () => {
        options.setLocation(newLocation);
        toast.success(information.locationRenamed);
      });
    },
    [options, library]
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
        folderMode={options.folderMode}
        toggleFolderMode={toggleFolderMode}
      />
    ),
    [resetFilter, items, options.folderMode, toggleFolderMode]
  );

  const viewLocations = useMemo(
    () => (
      <ViewSideLocation
        active={options.location}
        setActive={options.setLocation}
        subfolders={subfolders}
        folderTree={library.folders}
        toggleFolderMode={toggleFolderMode}
        toggleSubfolders={toggleSubfolders}
        onRenameLocation={promptRenameLocation}
      />
    ),
    [
      options.location,
      library.folders,
      options.setLocation,
      toggleFolderMode,
      promptRenameLocation,
      toggleSubfolders,
      subfolders
    ]
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
          initial={options.location}
          onChangeLocation={handleRenameLocation}
          hideWindow={() => setShowRenameLocation(false)}
        />
      ) : null}
      <Overlay
        position={options.noNavigation ? 'top-[0.25rem] right-[3rem]' : 'top-[0.25rem] right-0'}
        layer='z-tooltip'
        className='transition-all'
      >
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
        filterUser={filterUser}
        setFilterUser={setFilterUser}
        resetFilter={resetFilter}
        folderMode={options.folderMode}
        toggleFolderMode={toggleFolderMode}
      />

      <div className='flex'>
        <AnimatePresence initial={false}>{options.folderMode ? viewLocations : null}</AnimatePresence>
        {viewLibrary}
      </div>
    </DataLoader>
  );
}

export default LibraryPage;
