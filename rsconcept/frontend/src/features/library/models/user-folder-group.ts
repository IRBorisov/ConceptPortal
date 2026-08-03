/**
 * UI-only grouping of personal (/U) folders by owner in admin library view.
 * Virtual segments are never stored as real item locations.
 */

import { LocationHead } from '@rsconcept/domain/library';

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
