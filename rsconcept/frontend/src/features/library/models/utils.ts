/**
 * Module: API for Library entities and Users.
 */

import { type LibraryItem } from '@rsconcept/domain/library';
import { validateLocationFormat } from '@rsconcept/domain/library/library-api';

import { limits } from '@/utils/constants';

/** Generate title for clone {@link LibraryItem}. */
export function cloneTitle(target: LibraryItem): string {
  if (!target.title.includes('[клон]')) {
    return target.title + ' [клон]';
  } else {
    return target.title + '+';
  }
}

/** Generate next version for {@link VersionInfo}. */
export function nextVersion(version: string): string {
  const dot = version.lastIndexOf('.');
  if (!dot) {
    return version;
  }
  const lastNumber = Number(version.substring(dot + 1));
  if (!lastNumber) {
    return version;
  }
  return `${version.substring(0, dot)}.${lastNumber + 1}`;
}

/** Validate location format. */
export function validateLocation(location: string): boolean {
  return location.length <= limits.len_location && validateLocationFormat(location);
}
