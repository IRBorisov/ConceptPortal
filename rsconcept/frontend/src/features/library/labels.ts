import { AccessPolicy, type CurrentVersion, LibraryItemType, LocationHead, type VersionInfo } from '@/domain/library';
import { type FolderNode } from '@/domain/library/folder-tree';
import { validateLocation } from '@/domain/library/library-api';

import { formatLabel } from '@/app/i18n/format-app-message';
import { libraryLid } from '@/app/i18n/labels/library-ui';

import { type RO } from '@/utils/meta';

const LOCATION_LID: Record<LocationHead, string> = {
  [LocationHead.USER]: libraryLid.location.user,
  [LocationHead.COMMON]: libraryLid.location.common,
  [LocationHead.LIBRARY]: libraryLid.location.library,
  [LocationHead.PROJECTS]: libraryLid.location.projects
};

const LOCATION_SHORT_LID: Record<LocationHead, string> = {
  [LocationHead.USER]: libraryLid.locationShort.user,
  [LocationHead.COMMON]: libraryLid.locationShort.common,
  [LocationHead.LIBRARY]: libraryLid.locationShort.library,
  [LocationHead.PROJECTS]: libraryLid.locationShort.projects
};

const LOCATION_DESC_LID: Record<LocationHead, string> = {
  [LocationHead.USER]: libraryLid.locationDesc.user,
  [LocationHead.COMMON]: libraryLid.locationDesc.common,
  [LocationHead.LIBRARY]: libraryLid.locationDesc.library,
  [LocationHead.PROJECTS]: libraryLid.locationDesc.projects
};

const ACCESS_LID: Record<AccessPolicy, string> = {
  [AccessPolicy.PRIVATE]: libraryLid.access.private,
  [AccessPolicy.PROTECTED]: libraryLid.access.protected,
  [AccessPolicy.PUBLIC]: libraryLid.access.public
};

const ACCESS_DESC_LID: Record<AccessPolicy, string> = {
  [AccessPolicy.PRIVATE]: libraryLid.accessDesc.private,
  [AccessPolicy.PROTECTED]: libraryLid.accessDesc.protected,
  [AccessPolicy.PUBLIC]: libraryLid.accessDesc.public
};

const ITEM_TYPE_LID: Record<LibraryItemType, string> = {
  [LibraryItemType.RSFORM]: libraryLid.itemType.rsform,
  [LibraryItemType.OSS]: libraryLid.itemType.oss,
  [LibraryItemType.RSMODEL]: libraryLid.itemType.rsmodel
};

const ITEM_TYPE_DESC_LID: Record<LibraryItemType, string> = {
  [LibraryItemType.RSFORM]: libraryLid.itemTypeDesc.rsform,
  [LibraryItemType.OSS]: libraryLid.itemTypeDesc.oss,
  [LibraryItemType.RSMODEL]: libraryLid.itemTypeDesc.rsmodel
};

/** Retrieves label for {@link LocationHead}. */
export function labelLocationHead(head: LocationHead): string {
  const id = LOCATION_LID[head];
  return id ? formatLabel(id) : String(head);
}

/** Retrieves compact breadcrumb label for {@link LocationHead}. */
export function labelLocationHeadShort(head: LocationHead): string {
  const id = LOCATION_SHORT_LID[head];
  return id ? formatLabel(id) : String(head);
}

/** Retrieves description for {@link LocationHead}. */
export function describeLocationHead(head: LocationHead): string {
  const id = LOCATION_DESC_LID[head];
  return id ? formatLabel(id) : String(head);
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
  return id ? formatLabel(id) : String(policy);
}

/** Retrieves description for {@link AccessPolicy}. */
export function describeAccessPolicy(policy: AccessPolicy): string {
  const id = ACCESS_DESC_LID[policy];
  return id ? formatLabel(id) : String(policy);
}

/** Retrieves label for {@link LibraryItemType}. */
export function labelLibraryItemType(itemType: LibraryItemType): string {
  const id = ITEM_TYPE_LID[itemType];
  return id ? formatLabel(id) : String(itemType);
}

/** Retrieves description for {@link LibraryItemType}. */
export function describeLibraryItemType(itemType: LibraryItemType): string {
  const id = ITEM_TYPE_DESC_LID[itemType];
  return id ? formatLabel(id) : String(itemType);
}

/** Generates label for {@link VersionInfo} of {@link RSForm}. */
export function labelVersion(value: CurrentVersion, items: RO<VersionInfo[]>) {
  const version = items.find(ver => ver.id === value);
  return version ? version.version : formatLabel(libraryLid.version.current);
}
