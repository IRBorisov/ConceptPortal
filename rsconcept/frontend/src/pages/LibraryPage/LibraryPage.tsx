'use client';

import fileDownload from 'js-file-download';
import { useCallback, useEffect, useMemo, useState } from 'react';
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

  const hasCustomFilter =
    !!filter.path ||
    !!filter.query ||
    filter.head !== undefined ||
    filter.isEditor !== undefined ||
    filter.isOwned !== undefined ||
    filter.isVisible !== true ||
    filter.filterUser !== undefined ||
    !!filter.location;

  useEffect(() => {
    setItems(library.applyFilter(filter));
  }, [library, library.items.length, filter]);

  const toggleFolderMode = () => options.setFolderMode(prev => !prev);

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

  return (
    <DataLoader isLoading={library.loading} error={library.loadingError} hasNoData={library.items.length === 0}>
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
        className='cc-animate-position'
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
        onChangeQuery={setQuery}
        path={path}
        onChangePath={setPath}
        head={head}
        onChangeHead={setHead}
        isVisible={isVisible}
        isOwned={isOwned}
        toggleOwned={() => setIsOwned(prev => toggleTristateFlag(prev))}
        toggleVisible={() => setIsVisible(prev => toggleTristateFlag(prev))}
        isEditor={isEditor}
        toggleEditor={() => setIsEditor(prev => toggleTristateFlag(prev))}
        filterUser={filterUser}
        onChangeFilterUser={setFilterUser}
        resetFilter={resetFilter}
        folderMode={options.folderMode}
        toggleFolderMode={toggleFolderMode}
      />

      <div className='cc-fade-in flex'>
        <ViewSideLocation
          isVisible={options.folderMode}
          activeLocation={options.location}
          onChangeActiveLocation={options.setLocation}
          subfolders={subfolders}
          folderTree={library.folders}
          toggleFolderMode={toggleFolderMode}
          toggleSubfolders={() => setSubfolders(prev => !prev)}
          onRenameLocation={() => setShowRenameLocation(true)}
        />

        <TableLibraryItems
          resetQuery={resetFilter}
          items={items}
          folderMode={options.folderMode}
          toggleFolderMode={toggleFolderMode}
        />
      </div>
    </DataLoader>
  );
}

export default LibraryPage;
