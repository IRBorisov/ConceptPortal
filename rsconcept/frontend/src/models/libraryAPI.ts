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
