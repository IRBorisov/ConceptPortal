'use client';

import { ExportDropdown } from '@/components/control/export-dropdown';
import { useDialogsStore } from '@/stores/dialogs';

import { useApplyLibraryFilter } from '../../backend/use-apply-library-filter';
import { useLibrarySuspense } from '../../backend/use-library';
import { useRenameLocation } from '../../backend/use-rename-location';
import { useCreateLibraryFilter, useLibrarySearchStore } from '../../stores/library-search';

import { TableLibraryItems } from './table-library-items';
import { ToolbarSearch } from './toolbar-search';
import { ViewSideLocation } from './view-side-location';

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

  return (
    <>
      <ToolbarSearch className='top-0 h-9' total={libraryItems.length} filtered={filtered.length} />
      <div className='relative flex'>
        <ExportDropdown
          data={filtered}
          filename='library'
          className='absolute z-tooltip -top-8 right-6 hidden sm:block'
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
