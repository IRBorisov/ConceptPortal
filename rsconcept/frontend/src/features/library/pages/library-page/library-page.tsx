'use client';

import { useAuth } from '@/features/auth/backend/use-auth';

import { ExportDropdown } from '@/components/control/export-dropdown';
import { useDialogsStore } from '@/stores/dialogs';

import { useApplyLibraryFilter } from '../../backend/use-apply-library-filter';
import { useLibrary } from '../../backend/use-library';
import { useLibraryContextSearch } from '../../backend/use-library-context-search';
import { useRenameLocation } from '../../backend/use-rename-location';
import { useCreateLibraryFilter, useLibrarySearchStore } from '../../stores/library-search';

import { LocationBreadcrumb } from './location-breadcrumb';
import { TableLibraryItems } from './table-library-items';
import { ToolbarSearch } from './toolbar-search';
import { ViewSideLocation } from './view-side-location';

export function LibraryPage() {
  const { user, isAnonymous } = useAuth();
  const { items: libraryItems } = useLibrary();
  const { renameLocation } = useRenameLocation();

  const location = useLibrarySearchStore(state => state.location);
  const setLocation = useLibrarySearchStore(state => state.setLocation);

  const filter = useCreateLibraryFilter();
  const { matchIds } = useLibraryContextSearch({
    query: filter.query,
    contextFields: filter.contextFields,
    enabled: filter.searchMode === 'context'
  });
  const { filtered } = useApplyLibraryFilter(filter, matchIds);

  const showChangeLocation = useDialogsStore(state => state.showChangeLocation);
  const canRename = (() => {
    if (location.length <= 3 || isAnonymous) {
      return false;
    }
    if (user.is_staff) {
      return true;
    }
    const owned = libraryItems.filter(item => item.owner == user.id);
    const located = owned.filter(item => item.location == location || item.location.startsWith(`${location}/`));
    return located.length !== 0;
  })();

  function handleRenameLocation(newLocation: string) {
    void renameLocation({
      target: location,
      new_location: newLocation
    }).then(() => setLocation(newLocation));
  }

  return (
    <div className='relative flex'>
      <ViewSideLocation className='w-46 sm:w-60 shrink-0' />

      <div className='grow min-w-0 flex flex-col'>
        <LocationBreadcrumb
          className='bg-input'
          canRename={canRename}
          onRenameLocation={() => showChangeLocation({ initial: location, onChangeLocation: handleRenameLocation })}
        />

        <div className='overflow-hidden border-b rounded-b-none'>
          <div className='flex items-center gap-2 border-b rounded-b-none bg-input w-full'>
            <ToolbarSearch className='h-8 w-full' />
            <ExportDropdown data={filtered} filename='library' className='mr-1 hidden sm:block' />
          </div>
          <TableLibraryItems items={filtered} />
        </div>
      </div>
    </div>
  );
}
