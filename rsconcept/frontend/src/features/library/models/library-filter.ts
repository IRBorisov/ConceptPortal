/**
 * Module: Models for LibraryItem.
 */

import { type LibraryItemType, type LocationHead } from '@/domain/library';

/** Represents Library filter parameters. */
export interface LibraryFilter {
  query: string;

  folderMode: boolean;
  subfolders: boolean;
  path: string;
  head: LocationHead | null;
  location: string;

  itemType: LibraryItemType | null;
  isVisible: boolean | null;
  isOwned: boolean | null;
  isEditor: boolean | null;
  filterUser: number | null;
}
