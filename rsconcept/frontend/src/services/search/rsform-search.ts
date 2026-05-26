import { type Constituenta } from '@rsconcept/domain/library';

import { TextMatcher } from './text-matcher';

/** Checks if a given target {@link Constituenta} matches the specified query. */
export function matchConstituenta(target: Constituenta, query: string): boolean {
  const matcher = new TextMatcher(query);
  return (
    matcher.test(target.alias) ||
    matcher.test(target.term_resolved) ||
    matcher.test(target.definition_formal) ||
    matcher.test(target.definition_resolved) ||
    matcher.test(target.convention)
  );
}
