import { limits } from '@/utils/constants';
import { TextMatcher } from '@/utils/utils';

import { type LibraryItem } from './library';

const LOCATION_REGEXP = /^\/[PLUS]((\/[!\d\p{L}]([!\d\p{L}\- ]*[!\d\p{L}])?)*)?$/u; // cspell:disable-line

/** Checks if a given target {@link LibraryItem} matches the specified query. */
export function matchLibraryItem(target: LibraryItem, query: string): boolean {
  const matcher = new TextMatcher(query);
  return matcher.test(target.alias) || matcher.test(target.title) || matcher.test(target.description);
}

/** Checks if a given target {@link LibraryItem} location matches the specified query. */
export function matchLibraryItemLocation(target: LibraryItem, path: string): boolean {
  const matcher = new TextMatcher(path);
  return matcher.test(target.location);
}

/** Combining head and body into location. */
export function combineLocation(head: string, body?: string): string {
  return body ? `${head}/${body}` : head;
}

/** Validation location against regexp. */
export function validateLocation(location: string): boolean {
  return location.length <= limits.len_location && LOCATION_REGEXP.test(location);
}
