/**
 * UI-only grouping of personal (/U) folders by owner in admin library view.
 * Virtual segments are never stored as real item locations.
 */

import { type FolderNode, LocationHead } from '@rsconcept/domain/library';

const OWNER_SEGMENT_RE = /^!u(\d+)$/;

/** Virtual path segment for an owner group under /U. */
export function ownerFolderSegment(ownerId: number): string {
  return `!u${ownerId}`;
}

/** Parse owner id from a virtual group segment, or null if not a group segment. */
export function parseOwnerFolderSegment(segment: string): number | null {
  const match = OWNER_SEGMENT_RE.exec(segment);
  return match ? Number(match[1]) : null;
}

/** Build tree path including the virtual owner segment under /U. */
export function toGroupedUserLocation(location: string, ownerId: number | null): string {
  if (ownerId === null || !isUserLocation(location)) {
    return location;
  }
  const rest = location === LocationHead.USER ? '' : location.slice(LocationHead.USER.length);
  return `${LocationHead.USER}/${ownerFolderSegment(ownerId)}${rest}`;
}

/** Strip virtual owner segment from a tree path for store filters / clipboard. */
export function fromGroupedUserLocation(path: string): { location: string; ownerId: number | null } {
  if (!isUserLocation(path)) {
    return { location: path, ownerId: null };
  }
  const rest = path === LocationHead.USER ? '' : path.slice(LocationHead.USER.length);
  if (!rest.startsWith('/')) {
    return { location: path, ownerId: null };
  }
  const slash = rest.indexOf('/', 1);
  const segment = slash === -1 ? rest.slice(1) : rest.slice(1, slash);
  const ownerId = parseOwnerFolderSegment(segment);
  if (ownerId === null) {
    return { location: path, ownerId: null };
  }
  const tail = slash === -1 ? '' : rest.slice(slash);
  return { location: `${LocationHead.USER}${tail}`, ownerId };
}

/** True when `location` is the personal root `/U` or a path under it. */
export function isUserLocation(location: string): boolean {
  return location === LocationHead.USER || location.startsWith(`${LocationHead.USER}/`);
}

/**
 * Reorders a flat DFS folder list so the current user's owner group is first under `/U`.
 * Other roots and nested order inside each group are unchanged.
 */
export function prioritizeCurrentUserFolderGroups(items: FolderNode[], currentUserId: number | null): FolderNode[] {
  if (currentUserId === null) {
    return items;
  }
  const currentSegment = ownerFolderSegment(currentUserId);
  const userHead = LocationHead.USER.slice(1);
  const result: FolderNode[] = [];
  let index = 0;
  while (index < items.length) {
    const item = items[index];
    if (item.parent === null && item.text === userHead) {
      result.push(item);
      index += 1;
      const groups: FolderNode[][] = [];
      while (index < items.length && items[index].hasPredecessor(item)) {
        const node = items[index];
        if (node.parent === item) {
          groups.push([node]);
        } else {
          groups[groups.length - 1].push(node);
        }
        index += 1;
      }
      groups.sort((left, right) => {
        const leftKey = left[0].text;
        const rightKey = right[0].text;
        const leftCurrent = leftKey === currentSegment;
        const rightCurrent = rightKey === currentSegment;
        if (leftCurrent !== rightCurrent) {
          return leftCurrent ? -1 : 1;
        }
        return leftKey.localeCompare(rightKey);
      });
      for (const group of groups) {
        result.push(...group);
      }
      continue;
    }
    result.push(item);
    index += 1;
  }
  return result;
}
