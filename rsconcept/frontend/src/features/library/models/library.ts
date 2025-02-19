/**
 * Module: Models for LibraryItem.
 */

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
  query: string;

  folderMode: boolean;
  subfolders: boolean;
  path: string;
  head: LocationHead | null;
  location: string;

  isVisible: boolean | null;
  isOwned: boolean | null;
  isEditor: boolean | null;
  filterUser: number | null;
}
