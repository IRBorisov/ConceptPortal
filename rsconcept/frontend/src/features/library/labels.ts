import { AccessPolicy, type CurrentVersion, LocationHead, type VersionInfo } from '@/domain/library';
import { type FolderNode } from '@/domain/library/folder-tree';
import { validateLocation } from '@/domain/library/library-api';
import { globalTx } from '@/i18n';

import { type RO } from '@/utils/meta';

const LOCATION_LID: Record<LocationHead, string> = {
  [LocationHead.USER]: 'tx.lib.location.user',
  [LocationHead.COMMON]: 'tx.lib.location.common',
  [LocationHead.LIBRARY]: 'tx.lib.location.library',
  [LocationHead.PROJECTS]: 'tx.lib.location.projects'
};

const LOCATION_SHORT_LID: Record<LocationHead, string> = {
  [LocationHead.USER]: 'tx.lib.location.user.short',
  [LocationHead.COMMON]: 'tx.lib.location.common.short',
  [LocationHead.LIBRARY]: 'tx.lib.location.library.short',
  [LocationHead.PROJECTS]: 'tx.lib.location.projects.short'
};

const LOCATION_DESC_LID: Record<LocationHead, string> = {
  [LocationHead.USER]: 'tx.lib.location.user.hint',
  [LocationHead.COMMON]: 'tx.lib.location.common.hint',
  [LocationHead.LIBRARY]: 'tx.lib.location.library.hint',
  [LocationHead.PROJECTS]: 'tx.lib.location.projects.hint'
};

const ACCESS_LID: Record<AccessPolicy, string> = {
  [AccessPolicy.PRIVATE]: 'tx.lib.access.private',
  [AccessPolicy.PROTECTED]: 'tx.lib.access.protected',
  [AccessPolicy.PUBLIC]: 'tx.lib.access.public'
};

const ACCESS_DESC_LID: Record<AccessPolicy, string> = {
  [AccessPolicy.PRIVATE]: 'tx.lib.access.private.hint',
  [AccessPolicy.PROTECTED]: 'tx.lib.access.protected.desc',
  [AccessPolicy.PUBLIC]: 'tx.lib.access.public.desc'
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

/** Display label for one library path segment (first segment uses head short label when valid). */
export function labelLibraryLocationSegment(segment: string, segmentIndex: number): string {
  if (segmentIndex === 0 && validateLocation(`/${segment}`)) {
    return labelLocationHeadShort(`/${segment}` as LocationHead);
  }
  return segment;
}

/** Full library location for display; substitutes the root head like {@link labelFolderNode}. */
export function labelLibraryLocationPath(location: string): string {
  const segments = location.trim().split('/').filter(Boolean);
  if (segments.length === 0) {
    return '';
  }
  return segments.map((segment, index) => labelLibraryLocationSegment(segment, index)).join(' / ');
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

/** Generates label for {@link VersionInfo} of {@link RSForm}. */
export function labelVersion(value: CurrentVersion, items: RO<VersionInfo[]>) {
  const version = items.find(ver => ver.id === value);
  return version ? version.version : globalTx('tx.lib.version.latest.short').toLocaleLowerCase();
}
