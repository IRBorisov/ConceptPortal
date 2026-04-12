/**
 * Module: Models for LibraryItem.
 */

/** Represents type of library items. */
export const LibraryItemType = {
  RSFORM: 'rsform',
  OSS: 'oss',
  RSMODEL: 'rsmodel'
} as const;
export type LibraryItemType = (typeof LibraryItemType)[keyof typeof LibraryItemType];

/** Represents Access policy for library items.*/
export const AccessPolicy = {
  PUBLIC: 'public',
  PROTECTED: 'protected',
  PRIVATE: 'private'
} as const;
export type AccessPolicy = (typeof AccessPolicy)[keyof typeof AccessPolicy];

/** Represents valid location headers. */
export const LocationHead = {
  USER: '/U',
  COMMON: '/S',
  PROJECTS: '/P',
  LIBRARY: '/L'
} as const;
export type LocationHead = (typeof LocationHead)[keyof typeof LocationHead];

/** Represents {@link LibraryItem} minimal reference data. */
export interface LibraryItemReference {
  id: number;
  alias: string;
}

/** Represents library item common data typical for all item types. */
export interface LibraryItem {
  id: number;
  item_type: LibraryItemType;
  alias: string;
  title: string;
  description: string;
  visible: boolean;
  read_only: boolean;
  location: string;
  access_policy: AccessPolicy;
  time_create: string;
  time_update: string;
  owner: number | null;
}

/** Represents library item version information. */
export interface VersionInfo {
  id: number;
  version: string;
  description: string;
  time_create: string;
}

/** Represents current version */
export type CurrentVersion = number | 'latest';

/** Represents basic schemas location. */
export const BASIC_SCHEMAS = LocationHead.LIBRARY + '/Базовые';
