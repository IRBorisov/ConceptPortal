import { type BasicBinding } from '@rsconcept/domain/library';

import { TextMatcher } from './text-matcher';

/**
 * Filters {@link BasicBinding} entries by a query string.
 *
 * Returns matching entry ids in insertion order. When `query` is empty all ids are returned.
 * `alwaysInclude` ids are preserved in the result (at their original position) regardless of match.
 */
export function filterBindingByQuery(
  binding: BasicBinding,
  query: string,
  alwaysInclude?: readonly number[]
): number[] {
  if (!query) {
    return Object.keys(binding).map(Number);
  }
  const matcher = new TextMatcher(query);
  const keep = new Set(alwaysInclude);
  return Object.entries(binding)
    .filter(([id, text]) => matcher.test(text) || keep.has(Number(id)))
    .map(([id]) => Number(id));
}
