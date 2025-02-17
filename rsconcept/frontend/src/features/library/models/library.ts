/**
 * Module: Models for LibraryItem.
 */

import { z } from 'zod';

/**
 * Represents type of library items.
 */
export enum LibraryItemType {
  RSFORM = 'rsform',
  OSS = 'oss'
}

/**
 * Represents Access policy for library items.
 */
export enum AccessPolicy {
  PUBLIC = 'public',
  PROTECTED = 'protected',
  PRIVATE = 'private'
}

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

export const schemaVersionInfo = z.object({
  id: z.coerce.number(),
  version: z.string(),
  description: z.string(),
  time_create: z.string()
});

/**
 * Represents library item version information.
 */
export type IVersionInfo = z.infer<typeof schemaVersionInfo>;

/**
 * Represents library item common data typical for all item types.
 */
export interface ILibraryItem {
  id: number;
  item_type: LibraryItemType;
  title: string;
  alias: string;
  comment: string;
  visible: boolean;
  read_only: boolean;
  location: string;
  access_policy: AccessPolicy;
  time_create: string;
  time_update: string;
  owner: number | null;
}

/**
 * Represents {@link ILibraryItem} constant data loaded for both OSS and RSForm.
 */
export interface ILibraryItemData extends ILibraryItem {
  editors: number[];
}

/**
 * Represents {@link ILibraryItem} minimal reference data.
 */
export interface ILibraryItemReference {
  id: number;
  alias: string;
}

/**
 * Represents {@link ILibraryItem} extended data with versions.
 */
export interface ILibraryItemVersioned extends ILibraryItemData {
  version?: number;
  versions: IVersionInfo[];
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
