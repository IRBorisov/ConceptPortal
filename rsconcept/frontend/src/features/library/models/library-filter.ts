/**
 * Module: Models for LibraryItem.
 */

import { type LibraryItemType } from '@rsconcept/domain/library';

import { type LibraryContextSearchField, type LibraryContextSearchFields } from './library-context-search';

export type LibrarySearchMode = 'metadata' | 'context';

/** Represents Library filter parameters. */
export interface LibraryFilter {
  query: string;
  searchMode: LibrarySearchMode;
  contextFields: LibraryContextSearchFields;

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

export type { LibraryContextSearchField, LibraryContextSearchFields };
