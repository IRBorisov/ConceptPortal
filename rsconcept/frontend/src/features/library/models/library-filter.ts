/**
 * Module: Models for LibraryItem.
 */

import { type LibraryItemType } from '@/domain/library';

/** Represents Library filter parameters. */
export interface LibraryFilter {
  query: string;

  folderMode: boolean;
  subfolders: boolean;
  path: string;
  location: string;

  itemType: LibraryItemType | null;
  isVisible: boolean | null;
  isOwned: boolean | null;
  isEditor: boolean | null;
  filterUser: number | null;
}
