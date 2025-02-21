import { useAuthSuspense } from '@/features/auth';

import { type ILibraryFilter } from '../models/library';
import { matchLibraryItem, matchLibraryItemLocation } from '../models/libraryAPI';

import { useLibrary } from './useLibrary';

export function useApplyLibraryFilter(filter: ILibraryFilter) {
  const { items } = useLibrary();
  const { user } = useAuthSuspense();

  let result = items;
  if (!filter.folderMode && filter.head) {
    result = result.filter(item => item.location.startsWith(filter.head!));
  }
  if (filter.folderMode && filter.location) {
    if (filter.subfolders) {
      result = result.filter(
        item => item.location == filter.location || item.location.startsWith(filter.location + '/')
      );
    } else {
      result = result.filter(item => item.location == filter.location);
    }
  }
  if (filter.isVisible !== null) {
    result = result.filter(item => filter.isVisible === item.visible);
  }
  if (filter.isOwned !== null) {
    result = result.filter(item => filter.isOwned === (item.owner === user.id));
  }
  if (filter.isEditor !== null) {
    result = result.filter(item => filter.isEditor == user.editor.includes(item.id));
  }
  if (filter.filterUser !== null) {
    result = result.filter(item => filter.filterUser === item.owner);
  }
  if (!filter.folderMode && !!filter.path) {
    result = result.filter(item => matchLibraryItemLocation(item, filter.path));
  }
  if (filter.query) {
    result = result.filter(item => matchLibraryItem(item, filter.query));
  }

  return { filtered: result };
}
