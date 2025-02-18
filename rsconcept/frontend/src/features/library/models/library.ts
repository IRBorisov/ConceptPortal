/**
 * Module: Models for LibraryItem.
 */

import { LibraryItemType } from '../backend/types';

/**
 * Represents valid location headers.
 */
export enum LocationHead {
  USER = '/U',
  COMMON = '/S',
  PROJECTS = '/P',
  LIBRARY = '/L'
}

export const BASIC_SCHEMAS = '/L/Базовые';

/**
 * Represents {@link ILibraryItem} minimal reference data.
 */
export interface ILibraryItemReference {
  id: number;
  alias: string;
}

/**
 * Represents Library filter parameters.
 */
export interface ILibraryFilter {
  type?: LibraryItemType;
  query?: string;

  folderMode?: boolean;
  subfolders?: boolean;
  path?: string;
  head?: LocationHead;
  location?: string;

  isVisible?: boolean;
  isOwned?: boolean;
  isEditor?: boolean;
  filterUser?: number;
}
