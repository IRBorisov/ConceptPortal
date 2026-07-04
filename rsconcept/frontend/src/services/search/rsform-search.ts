/**
 * Constituent ({@link Constituenta}) text search for schema and model lists.
 *
 * Matching is case-insensitive. Queries are interpreted as regular expressions when valid;
 * otherwise {@link TextMatcher} falls back to substring search.
 *
 * When several fields match, {@link cstMatchRank} reports the **best** (most relevant) rank only.
 * {@link filterConstituentaByQuery} sorts results by that rank and keeps the original schema
 * order for ties.
 */
import { type Constituenta } from '@rsconcept/domain/library';
import { isBasicConcept } from '@rsconcept/domain/library/rsform-api';

import { TextMatcher } from './text-matcher';

/**
 * Relevance ranks for constituent text search.
 *
 * Lower numeric values are more relevant. Used by {@link cstMatchRank} and
 * {@link filterConstituentaByQuery}.
 *
 * Field mapping:
 * - `alias` — {@link Constituenta.alias}
 * - `term` — `term_resolved`, then `term_raw`
 * - `formalDefinition` — `definition_formal`
 * - `textDefinition` — `definition_resolved`, then `definition_raw`
 * - `convention` — `convention` on basic concepts ({@link isBasicConcept})
 * - `comment` — `convention` on derived concepts (developer comment in the UI)
 */
export const CST_MATCH_RANK = {
  alias: 0,
  term: 1,
  formalDefinition: 2,
  textDefinition: 3,
  convention: 4,
  comment: 5
} as const;

/**
 * Returns the best (lowest) {@link CST_MATCH_RANK} for a constituent, or `null` when there is no match.
 *
 * An empty or whitespace-only `query` never matches.
 */
export function cstMatchRank(target: Constituenta, query: string): number | null {
  const trimmed = query.trim();
  if (!trimmed) {
    return null;
  }

  const matcher = new TextMatcher(trimmed);

  if (matcher.test(target.alias)) {
    return CST_MATCH_RANK.alias;
  }
  if (matcher.test(target.term_resolved) || matcher.test(target.term_raw)) {
    return CST_MATCH_RANK.term;
  }
  if (matcher.test(target.definition_formal)) {
    return CST_MATCH_RANK.formalDefinition;
  }
  if (matcher.test(target.definition_resolved) || matcher.test(target.definition_raw)) {
    return CST_MATCH_RANK.textDefinition;
  }
  if (isBasicConcept(target.cst_type) && matcher.test(target.convention)) {
    return CST_MATCH_RANK.convention;
  }
  if (!isBasicConcept(target.cst_type) && matcher.test(target.convention)) {
    return CST_MATCH_RANK.comment;
  }

  return null;
}

/**
 * Checks whether a constituent matches `query` in any searchable field.
 *
 * Equivalent to `cstMatchRank(target, query) !== null`. Prefer {@link filterConstituentaByQuery}
 * when the caller needs a filtered, relevance-sorted list.
 */
export function matchConstituenta(target: Constituenta, query: string): boolean {
  return cstMatchRank(target, query) !== null;
}

/**
 * Filters constituents by `query` and sorts matches by {@link cstMatchRank}.
 *
 * - Empty or whitespace-only `query` returns `items` unchanged (same reference).
 * - Non-matching constituents are omitted.
 * - Equal rank keeps the original index order from `items`.
 */
export function filterConstituentaByQuery(items: Constituenta[], query: string): Constituenta[] {
  const trimmed = query.trim();
  if (!trimmed) {
    return items;
  }

  const ranked = items
    .map((cst, index) => ({ cst, index, rank: cstMatchRank(cst, trimmed) }))
    .filter((entry): entry is { cst: Constituenta; index: number; rank: number } => entry.rank !== null);

  ranked.sort((a, b) => a.rank - b.rank || a.index - b.index);
  return ranked.map(entry => entry.cst);
}
