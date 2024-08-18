/**
 * Module: API for OperationSystem.
 */

import { TextMatcher } from '@/utils/utils';

import { ILibraryItem } from './library';
import { IOperation, IOperationSchema } from './oss';

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

/**
 * Sorts library items relevant for the specified {@link IOperationSchema}.
 *
 * @param oss - The {@link IOperationSchema} to be sorted.
 * @param items - The items to be sorted.
 */
export function sortItemsForOSS(oss: IOperationSchema, items: ILibraryItem[]): ILibraryItem[] {
  const result = items.filter(item => item.location === oss.location);
  for (const item of items) {
    if (item.visible && item.owner === oss.owner && !result.includes(item)) {
      result.push(item);
    }
  }
  for (const item of items) {
    if (item.visible && !result.includes(item)) {
      result.push(item);
    }
  }
  for (const item of items) {
    if (!result.includes(item)) {
      result.push(item);
    }
  }
  return result;
}
