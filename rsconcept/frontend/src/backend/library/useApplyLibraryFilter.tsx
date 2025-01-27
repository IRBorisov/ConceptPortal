import { useAuth } from '@/backend/auth/useAuth';
import { matchLibraryItem, matchLibraryItemLocation } from '@/models/libraryAPI';
import { ILibraryFilter } from '@/models/miscellaneous';

import { useLibrary } from './useLibrary';

export function useApplyLibraryFilter(filter: ILibraryFilter) {
  const { items } = useLibrary();
  const { user } = useAuth();

  let result = items;
  if (!filter.folderMode && filter.head) {
    result = result.filter(item => item.location.startsWith(filter.head!));
  }
  if (filter.folderMode && filter.location) {
    if (filter.subfolders) {
      result = result.filter(
        item => item.location == filter.location || item.location.startsWith(filter.location! + '/')
      );
    } else {
      result = result.filter(item => item.location == filter.location);
    }
  }
  if (filter.type) {
    result = result.filter(item => item.item_type === filter.type);
  }
  if (filter.isVisible !== undefined) {
    result = result.filter(item => filter.isVisible === item.visible);
  }
  if (filter.isOwned !== undefined) {
    result = result.filter(item => filter.isOwned === (item.owner === user?.id));
  }
  if (filter.isEditor !== undefined) {
    result = result.filter(item => filter.isEditor == user?.editor.includes(item.id));
  }
  if (filter.filterUser !== undefined) {
    result = result.filter(item => filter.filterUser === item.owner);
  }
  if (!filter.folderMode && filter.path) {
    result = result.filter(item => matchLibraryItemLocation(item, filter.path!));
  }
  if (filter.query) {
    result = result.filter(item => matchLibraryItem(item, filter.query!));
  }

  return { filtered: result };
}
