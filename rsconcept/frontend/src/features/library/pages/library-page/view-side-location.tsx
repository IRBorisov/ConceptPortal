'use client';

import { toast } from 'react-toastify';
import clsx from 'clsx';

import { useTx } from '@/i18n';
import { type FolderNode } from '@rsconcept/domain/library';

import { useAuth } from '@/features/auth/backend/use-auth';

import { useMainHeight } from '@/stores/app-layout';
import { usePreferencesStore } from '@/stores/preferences';
import { prefixes } from '@/utils/constants';

import { SelectLocation } from '../../components/select-location';
import { fromGroupedUserLocation, isUserLocation, toGroupedUserLocation } from '../../models/user-folder-group';
import { useLibrarySearchStore } from '../../stores/library-search';

interface ViewSideLocationProps {
  className?: string;
}

/**
 * Library sidebar folder explorer.
 * In staff admin mode, personal `/U` folders are grouped by owner; selection syncs `location` and `filterUser`.
 */
export function ViewSideLocation({ className }: ViewSideLocationProps) {
  const tx = useTx();
  const { user } = useAuth();
  const adminMode = usePreferencesStore(state => state.adminMode);
  const groupUserFoldersByOwner = user.is_staff && adminMode;

  const location = useLibrarySearchStore(state => state.location);
  const setLocation = useLibrarySearchStore(state => state.setLocation);
  const filterUser = useLibrarySearchStore(state => state.filterUser);
  const setFilterUser = useLibrarySearchStore(state => state.setFilterUser);

  const maxHeight = useMainHeight();
  const treeValue = groupUserFoldersByOwner ? toGroupedUserLocation(location, filterUser) : location;

  function handleSelectFolder(target: FolderNode) {
    const path = target.getPath();
    if (!groupUserFoldersByOwner) {
      setLocation(path);
      return;
    }
    const { location: nextLocation, ownerId } = fromGroupedUserLocation(path);
    setLocation(nextLocation);
    if (ownerId !== null) {
      setFilterUser(ownerId);
    } else if (isUserLocation(nextLocation)) {
      // Bare /U path without a user group — show all owners again.
      setFilterUser(null);
    }
  }

  function handleCopyPath(target: FolderNode) {
    const path = groupUserFoldersByOwner ? fromGroupedUserLocation(target.getPath()).location : target.getPath();
    navigator.clipboard
      .writeText(path)
      .then(() => toast.success(tx('tx.general.copy.toClipboard.success')))
      .catch(error => {
        toast.error(error instanceof Error ? error.message : tx('tx.general.copy.toClipboard.fail'));
        console.error(error);
      });
  }

  return (
    <div
      className={clsx(
        'relative',
        'border-r border-b bg-input',
        'flex flex-col text-xs sm:text-sm select-none',
        className
      )}
      data-tour='library-folders'
    >
      <SelectLocation
        className='cc-scroll-left cc-scroll-stable'
        value={treeValue}
        prefix={prefixes.folders_list}
        groupUserFoldersByOwner={groupUserFoldersByOwner}
        onSelect={handleSelectFolder}
        onControlClick={handleCopyPath}
        style={{ maxHeight: maxHeight }}
      />
    </div>
  );
}
