'use client';

import fileDownload from 'js-file-download';
import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';

import { IconCSV } from '@/components/Icons';
import MiniButton from '@/components/ui/MiniButton';
import Overlay from '@/components/ui/Overlay';
import DataLoader from '@/components/wrap/DataLoader';
import { useLibrary } from '@/context/LibraryContext';
import DlgChangeLocation from '@/dialogs/DlgChangeLocation';
import { IRenameLocationData } from '@/models/library';
import { useAppLayoutStore } from '@/stores/appLayout';
import { useLibraryFilter, useLibrarySearchStore } from '@/stores/librarySearch';
import { information } from '@/utils/labels';
import { convertToCSV } from '@/utils/utils';

import TableLibraryItems from './TableLibraryItems';
import ToolbarSearch from './ToolbarSearch';
import ViewSideLocation from './ViewSideLocation';

function LibraryPage() {
  const library = useLibrary();
  const noNavigation = useAppLayoutStore(state => state.noNavigation);

  const folderMode = useLibrarySearchStore(state => state.folderMode);
  const location = useLibrarySearchStore(state => state.location);
  const setLocation = useLibrarySearchStore(state => state.setLocation);

  const filter = useLibraryFilter();
  const items = library.applyFilter(filter);

  const [showRenameLocation, setShowRenameLocation] = useState(false);

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
    [location, setLocation, library]
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
          initial={location}
          onChangeLocation={handleRenameLocation}
          hideWindow={() => setShowRenameLocation(false)}
        />
      ) : null}
      <Overlay
        position={noNavigation ? 'top-[0.25rem] right-[3rem]' : 'top-[0.25rem] right-0'}
        layer='z-tooltip'
        className='cc-animate-position'
      >
        <MiniButton
          title='Выгрузить в формате CSV'
          icon={<IconCSV size='1.25rem' className='icon-green' />}
          onClick={handleDownloadCSV}
        />
      </Overlay>
      <ToolbarSearch total={library.items.length ?? 0} filtered={items.length} />

      <div className='cc-fade-in flex'>
        <ViewSideLocation
          isVisible={folderMode}
          folderTree={library.folders}
          onRenameLocation={() => setShowRenameLocation(true)}
        />

        <TableLibraryItems items={items} />
      </div>
    </DataLoader>
  );
}

export default LibraryPage;
