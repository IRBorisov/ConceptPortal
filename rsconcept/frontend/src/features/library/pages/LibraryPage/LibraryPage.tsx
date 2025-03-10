'use client';

import { toast } from 'react-toastify';
import fileDownload from 'js-file-download';

import { MiniButton } from '@/components/Control';
import { IconCSV } from '@/components/Icons';
import { useDialogsStore } from '@/stores/dialogs';
import { infoMsg } from '@/utils/labels';
import { convertToCSV } from '@/utils/utils';

import { useApplyLibraryFilter } from '../../backend/useApplyLibraryFilter';
import { useLibrarySuspense } from '../../backend/useLibrary';
import { useRenameLocation } from '../../backend/useRenameLocation';
import { useCreateLibraryFilter, useLibrarySearchStore } from '../../stores/librarySearch';

import { TableLibraryItems } from './TableLibraryItems';
import { ToolbarSearch } from './ToolbarSearch';
import { ViewSideLocation } from './ViewSideLocation';

export function LibraryPage() {
  const { items: libraryItems } = useLibrarySuspense();
  const { renameLocation } = useRenameLocation();

  const folderMode = useLibrarySearchStore(state => state.folderMode);
  const location = useLibrarySearchStore(state => state.location);
  const setLocation = useLibrarySearchStore(state => state.setLocation);

  const filter = useCreateLibraryFilter();
  const { filtered } = useApplyLibraryFilter(filter);

  const showChangeLocation = useDialogsStore(state => state.showChangeLocation);

  function handleRenameLocation(newLocation: string) {
    void renameLocation({
      target: location,
      new_location: newLocation
    }).then(() => setLocation(newLocation));
  }

  function handleDownloadCSV() {
    if (filtered.length === 0) {
      toast.error(infoMsg.noDataToExport);
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
      <ToolbarSearch total={libraryItems.length} filtered={filtered.length} />
      <div className='relative cc-fade-in flex'>
        <MiniButton
          className='absolute z-tooltip top-1 right-0 cc-animate-position'
          title='Выгрузить в формате CSV'
          icon={<IconCSV size='1.25rem' className='icon-green' />}
          onClick={handleDownloadCSV}
        />

        <ViewSideLocation
          isVisible={folderMode}
          onRenameLocation={() => showChangeLocation({ initial: location, onChangeLocation: handleRenameLocation })}
        />

        <TableLibraryItems items={filtered} />
      </div>
    </>
  );
}
