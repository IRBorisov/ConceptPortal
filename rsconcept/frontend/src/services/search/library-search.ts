import { type LibraryItem } from '@rsconcept/domain/library';

import { TextMatcher } from './text-matcher';

/**
 * Checks whether a library item matches `query` against alias, title, or description.
 */
export function matchLibraryItem(target: LibraryItem, query: string): boolean {
  const matcher = new TextMatcher(query);
  return matcher.test(target.alias) || matcher.test(target.title) || matcher.test(target.description);
}

/** Checks whether a library item's {@link LibraryItem.location} matches `path`. */
export function matchLibraryItemLocation(target: LibraryItem, path: string): boolean {
  const matcher = new TextMatcher(path);
  return matcher.test(target.location);
}
