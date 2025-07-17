/**
 * Module: API for Library entities and Users.
 */

import { limits } from '@/utils/constants';
import { TextMatcher } from '@/utils/utils';

import { type ILibraryItem } from '../backend/types';

const LOCATION_REGEXP = /^\/[PLUS]((\/[!\d\p{L}]([!\d\p{L}\- ]*[!\d\p{L}])?)*)?$/u; // cspell:disable-line

/**
 * Checks if a given target {@link ILibraryItem} matches the specified query.
 *
 * @param target - item to be matched
 * @param query - text to be found in target attributes
 */
export function matchLibraryItem(target: ILibraryItem, query: string): boolean {
  const matcher = new TextMatcher(query);
  return matcher.test(target.alias) || matcher.test(target.title) || matcher.test(target.description);
}

/**
 * Checks if a given target {@link ILibraryItem} location matches the specified query.
 *
 * @param target - item to be matched
 * @param query - text to be found
 */
export function matchLibraryItemLocation(target: ILibraryItem, path: string): boolean {
  const matcher = new TextMatcher(path);
  return matcher.test(target.location);
}

/**
 * Generate title for clone {@link ILibraryItem}.
 */
export function cloneTitle(target: ILibraryItem): string {
  if (!target.title.includes('[клон]')) {
    return target.title + ' [клон]';
  } else {
    return target.title + '+';
  }
}

/**
 * Generate next version for {@link IVersionInfo}.
 */
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

/**
 * Validation location against regexp.
 */
export function validateLocation(location: string): boolean {
  return location.length <= limits.len_location && LOCATION_REGEXP.test(location);
}

/**
 * Combining head and body into location.
 */
export function combineLocation(head: string, body?: string): string {
  return body ? `${head}/${body}` : head;
}
