import { type LibraryItem } from '@rsconcept/domain/library';

import { TextMatcher } from './text-matcher';

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
