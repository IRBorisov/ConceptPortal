export {
  AccessPolicy,
  type LibraryItem,
  type LibraryItemData,
  LibraryItemType,
  schemaUpdateLibraryItem,
  type UpdateLibraryItemDTO,
  type VersionInfo
} from './backend/types';
export { BASIC_SCHEMAS, type CurrentVersion, type LibraryItemReference, LocationHead } from './models/library';
export { useLibrarySearchStore } from './stores/library-search';
