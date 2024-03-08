/**
 * Module: API for Library entities and Users.
 */

import { TextMatcher } from '@/utils/utils';

import { ILibraryItem } from './library';

/**
 * Checks if a given target {@link ILibraryItem} matches the specified query.
 *
 * @param target - item to be matched
 * @param query - text to be found in target attributes
 */
export function matchLibraryItem(target: ILibraryItem, query: string): boolean {
  const matcher = new TextMatcher(query);
  return matcher.test(target.alias) || matcher.test(target.title);
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
