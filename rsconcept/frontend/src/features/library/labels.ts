import { AccessPolicy, type CurrentVersion, LibraryItemType, LocationHead, type VersionInfo } from '@/domain/library';
import { type FolderNode } from '@/domain/library/folder-tree';
import { validateLocation } from '@/domain/library/library-api';
import { globalTx } from '@/i18n';

import { type RO } from '@/utils/meta';

const LOCATION_LID: Record<LocationHead, string> = {
  [LocationHead.USER]: 'labels.library.location.user',
  [LocationHead.COMMON]: 'labels.library.location.common',
  [LocationHead.LIBRARY]: 'labels.library.location.library',
  [LocationHead.PROJECTS]: 'labels.library.location.projects'
};

const LOCATION_SHORT_LID: Record<LocationHead, string> = {
  [LocationHead.USER]: 'labels.library.locationShort.user',
  [LocationHead.COMMON]: 'labels.library.locationShort.common',
  [LocationHead.LIBRARY]: 'labels.library.locationShort.library',
  [LocationHead.PROJECTS]: 'labels.library.locationShort.projects'
};

const LOCATION_DESC_LID: Record<LocationHead, string> = {
  [LocationHead.USER]: 'labels.library.locationDesc.user',
  [LocationHead.COMMON]: 'labels.library.locationDesc.common',
  [LocationHead.LIBRARY]: 'labels.library.locationDesc.library',
  [LocationHead.PROJECTS]: 'labels.library.locationDesc.projects'
};

const ACCESS_LID: Record<AccessPolicy, string> = {
  [AccessPolicy.PRIVATE]: 'labels.library.access.private',
  [AccessPolicy.PROTECTED]: 'labels.library.access.protected',
  [AccessPolicy.PUBLIC]: 'labels.library.access.public'
};

const ACCESS_DESC_LID: Record<AccessPolicy, string> = {
  [AccessPolicy.PRIVATE]: 'labels.library.accessDesc.private',
  [AccessPolicy.PROTECTED]: 'labels.library.accessDesc.protected',
  [AccessPolicy.PUBLIC]: 'labels.library.accessDesc.public'
};

const ITEM_TYPE_LID: Record<LibraryItemType, string> = {
  [LibraryItemType.RSFORM]: 'labels.library.itemType.rsform',
  [LibraryItemType.OSS]: 'labels.library.itemType.oss',
  [LibraryItemType.RSMODEL]: 'semantic.term.model'
};

const ITEM_TYPE_DESC_LID: Record<LibraryItemType, string> = {
  [LibraryItemType.RSFORM]: 'labels.library.itemTypeDesc.rsform',
  [LibraryItemType.OSS]: 'labels.library.itemTypeDesc.oss',
  [LibraryItemType.RSMODEL]: 'labels.library.itemTypeDesc.rsmodel'
};

/** Retrieves label for {@link LocationHead}. */
export function labelLocationHead(head: LocationHead): string {
  const id = LOCATION_LID[head];
  return id ? globalTx(id) : String(head);
}

/** Retrieves compact breadcrumb label for {@link LocationHead}. */
export function labelLocationHeadShort(head: LocationHead): string {
  const id = LOCATION_SHORT_LID[head];
  return id ? globalTx(id) : String(head);
}

/** Retrieves description for {@link LocationHead}. */
export function describeLocationHead(head: LocationHead): string {
  const id = LOCATION_DESC_LID[head];
  return id ? globalTx(id) : String(head);
}

/** Retrieves label for {@link FolderNode}. */
export function labelFolderNode(node: FolderNode): string {
  if (node.parent || !validateLocation('/' + node.text)) {
    return node.text;
  } else {
    return labelLocationHeadShort(('/' + node.text) as LocationHead);
  }
}

/** Retrieves label for {@link AccessPolicy}. */
export function labelAccessPolicy(policy: AccessPolicy): string {
  const id = ACCESS_LID[policy];
  return id ? globalTx(id) : String(policy);
}

/** Retrieves description for {@link AccessPolicy}. */
export function describeAccessPolicy(policy: AccessPolicy): string {
  const id = ACCESS_DESC_LID[policy];
  return id ? globalTx(id) : String(policy);
}

/** Retrieves label for {@link LibraryItemType}. */
export function labelLibraryItemType(itemType: LibraryItemType): string {
  const id = ITEM_TYPE_LID[itemType];
  return id ? globalTx(id) : String(itemType);
}

/** Retrieves description for {@link LibraryItemType}. */
export function describeLibraryItemType(itemType: LibraryItemType): string {
  const id = ITEM_TYPE_DESC_LID[itemType];
  return id ? globalTx(id) : String(itemType);
}

/** Generates label for {@link VersionInfo} of {@link RSForm}. */
export function labelVersion(value: CurrentVersion, items: RO<VersionInfo[]>) {
  const version = items.find(ver => ver.id === value);
  return version ? version.version : globalTx('labels.library.version.current');
}
