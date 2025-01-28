'use client';

import fileDownload from 'js-file-download';
import { toast } from 'react-toastify';

import { useApplyLibraryFilter } from '@/backend/library/useApplyLibraryFilter';
import { useLibrarySuspense } from '@/backend/library/useLibrary';
import { useRenameLocation } from '@/backend/library/useRenameLocation';
import { IconCSV } from '@/components/Icons';
import MiniButton from '@/components/ui/MiniButton';
import Overlay from '@/components/ui/Overlay';
import { useAppLayoutStore } from '@/stores/appLayout';
import { useDialogsStore } from '@/stores/dialogs';
import { useCreateLibraryFilter, useLibrarySearchStore } from '@/stores/librarySearch';
import { information } from '@/utils/labels';
import { convertToCSV } from '@/utils/utils';

import TableLibraryItems from './TableLibraryItems';
import ToolbarSearch from './ToolbarSearch';
import ViewSideLocation from './ViewSideLocation';

function LibraryPage() {
  const { items: libraryItems } = useLibrarySuspense();
  const { renameLocation } = useRenameLocation();

  const noNavigation = useAppLayoutStore(state => state.noNavigation);

  const folderMode = useLibrarySearchStore(state => state.folderMode);
  const location = useLibrarySearchStore(state => state.location);
  const setLocation = useLibrarySearchStore(state => state.setLocation);

  const filter = useCreateLibraryFilter();
  const { filtered } = useApplyLibraryFilter(filter);

  const showChangeLocation = useDialogsStore(state => state.showChangeLocation);

  function handleRenameLocation(newLocation: string) {
    renameLocation(
      {
        target: location,
        new_location: newLocation
      },
      () => setLocation(newLocation)
    );
  }

  function handleDownloadCSV() {
    if (filtered.length === 0) {
      toast.error(information.noDataToExport);
      return;
    }
    const blob = convertToCSV(filtered);
    try {
      fileDownload(blob, 'library.csv', 'text/csv;charset=utf-8;');
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
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
      <ToolbarSearch total={libraryItems.length} filtered={filtered.length} />

      <div className='cc-fade-in flex'>
        <ViewSideLocation
          isVisible={folderMode}
          onRenameLocation={() => showChangeLocation({ initial: location, onChangeLocation: handleRenameLocation })}
        />

        <TableLibraryItems items={filtered} />
      </div>
    </>
  );
}

export default LibraryPage;
