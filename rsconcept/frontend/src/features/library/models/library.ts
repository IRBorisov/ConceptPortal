/**
 * Module: Models for LibraryItem.
 */

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
  item: LibraryItemID;
  version: string;
  description: string;
  time_create: string;
}

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
export interface ILibraryItemReference extends Pick<ILibraryItem, 'id' | 'alias'> {}

/**
 * Represents {@link ILibraryItem} extended data with versions.
 */
export interface ILibraryItemVersioned extends ILibraryItemData {
  version?: VersionID;
  versions: IVersionInfo[];
}

/**
 * Represents common {@link ILibraryItem} editor controller.
 */
export interface ILibraryItemEditor {
  schema: ILibraryItemData;
  deleteSchema: () => void;

  isMutable: boolean;
  isAttachedToOSS: boolean;
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
