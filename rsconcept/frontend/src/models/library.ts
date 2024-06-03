/**
 * Module: Models for LibraryItem.
 */

import { UserID } from './user';

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
  LIBRARY = '/L',
  PROJECTS = '/P'
}

/**
 * Represents {@link LibraryItem} identifier type.
 */
export type LibraryItemID = number;

/**
 * Represents {@link Version} identifier type.
 */
export type VersionID = number;

/**
 * Represents library item version information.
 */
export interface IVersionInfo {
  id: VersionID;
  version: string;
  description: string;
  time_create: string;
}

/**
 * Represents user data, intended to create or update version metadata in persistent storage.
 */
export interface IVersionData extends Omit<IVersionInfo, 'id' | 'time_create'> {}

/**
 * Represents library item common data typical for all item types.
 */
export interface ILibraryItem {
  id: LibraryItemID;
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
  owner: UserID | null;
}

/**
 * Represents library item extended data.
 */
export interface ILibraryItemEx extends ILibraryItem {
  subscribers: UserID[];
  editors: UserID[];
  version?: VersionID;
  versions: IVersionInfo[];
}

/**
 * Represents update data for editing {@link ILibraryItem}.
 */
export interface ILibraryUpdateData
  extends Omit<ILibraryItem, 'time_create' | 'time_update' | 'access_policy' | 'location' | 'id' | 'owner'> {}

/**
 * Represents update data for editing {@link AccessPolicy} of a {@link ILibraryItem}.
 */
export interface ITargetAccessPolicy {
  access_policy: AccessPolicy;
}

/**
 * Represents update data for editing Location of a {@link ILibraryItem}.
 */
export interface ITargetLocation {
  location: string;
}

/**
 * Represents data, used for creating {@link IRSForm}.
 */
export interface ILibraryCreateData extends Omit<ILibraryItem, 'time_create' | 'time_update' | 'id' | 'owner'> {
  file?: File;
  fileName?: string;
}
