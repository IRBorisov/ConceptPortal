/**
 * Module: API for OperationSystem.
 */

import { TextMatcher } from '@/utils/utils';

import { IOperation } from './oss';

/**
 * Checks if a given target {@link IOperation} matches the specified query using.
 *
 * @param target - The target object to be matched.
 * @param query - The query string used for matching.
 */
export function matchOperation(target: IOperation, query: string): boolean {
  const matcher = new TextMatcher(query);
  return matcher.test(target.alias) || matcher.test(target.title);
}
