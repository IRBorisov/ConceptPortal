/**
 * Module: Models for LibraryItem.
 */

import { UserID } from './user';

/**
 * Represents type of library items.
 */
export enum LibraryItemType {
  RSFORM = 'rsform',
  OPERATIONS_SCHEMA = 'oss'
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
  is_common: boolean;
  is_canonical: boolean;
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
export interface ILibraryUpdateData extends Omit<ILibraryItem, 'time_create' | 'time_update' | 'id' | 'owner'> {}
