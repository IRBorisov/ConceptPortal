import { FolderTree, LocationHead } from '@rsconcept/domain/library';

import { isUserLocation, ownerFolderSegment } from '../models/user-folder-group';

import { useLibrary } from './use-library';

interface UseFoldersOptions {
  /**
   * Insert a virtual owner segment under `/U` (e.g. `/U/!u42/work`).
   * Used by the admin library sidebar; keep false in location pickers so stored paths stay real.
   */
  groupUserFoldersByOwner?: boolean;
}

/**
 * Builds a {@link FolderTree} from the current library list.
 * Always seeds the four location heads; optionally nests personal paths by owner for admin mode.
 */
export function useFolders(options?: UseFoldersOptions) {
  const { items } = useLibrary();
  const groupUserFoldersByOwner = options?.groupUserFoldersByOwner ?? false;
  const result = new FolderTree();
  result.addPath(LocationHead.USER, 0);
  result.addPath(LocationHead.COMMON, 0);
  result.addPath(LocationHead.LIBRARY, 0);
  result.addPath(LocationHead.PROJECTS, 0);
  for (const item of items) {
    if (groupUserFoldersByOwner && item.owner !== null && isUserLocation(item.location)) {
      const rest = item.location === LocationHead.USER ? '' : item.location.slice(LocationHead.USER.length);
      result.addPath(`${LocationHead.USER}/${ownerFolderSegment(item.owner)}${rest}`);
    } else {
      result.addPath(item.location);
    }
  }
  return { folders: result };
}
