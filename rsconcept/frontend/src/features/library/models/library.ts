/**
 * Module: Models for LibraryItem.
 */

import { type LibraryItemType } from '../backend/types';

/**
 * Represents valid location headers.
 */
export const LocationHead = {
  USER: '/U',
  COMMON: '/S',
  PROJECTS: '/P',
  LIBRARY: '/L'
} as const;
export type LocationHead = (typeof LocationHead)[keyof typeof LocationHead];

export const BASIC_SCHEMAS = '/L/Базовые';

/**
 * Represents {@link LibraryItem} minimal reference data.
 */
export interface LibraryItemReference {
  id: number;
  alias: string;
}

/**
 * Represents Library filter parameters.
 */
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

/** Represents current version */
export type CurrentVersion = number | 'latest';
