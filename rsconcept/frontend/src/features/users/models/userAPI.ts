/**
 * Module: API for formal representation for Users.
 */

import { TextMatcher } from '@/utils/utils';

import { type IUserInfo } from './user';

/**
 * Checks if a given target {@link IConstituenta} matches the specified query using the provided matching mode.
 *
 * @param target - The target object to be matched.
 * @param query - The query string used for matching.
 * @param mode - The matching mode to determine which properties to include in the matching process.
 */
export function matchUser(target: IUserInfo, query: string): boolean {
  const matcher = new TextMatcher(query);
  return matcher.test(target.last_name) || matcher.test(target.first_name);
}
