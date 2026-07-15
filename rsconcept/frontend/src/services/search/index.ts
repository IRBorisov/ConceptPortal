/**
 * Domain-neutral text search helpers for Portal UI.
 *
 * - {@link TextMatcher} — shared regexp matcher with plain-text fallback
 * - {@link matchLibraryItem}, {@link matchLibraryItemLocation} — library browser
 * - {@link matchConstituenta}, {@link filterConstituentaByQuery}, {@link cstMatchRank} — schema constituents
 * - {@link filterBindingByQuery} — basic-concept binding tables
 * - {@link ValueMatcher} — model value search
 */
export { filterBindingByQuery } from './binding-search';
export { matchLibraryItem, matchLibraryItemLocation } from './library-search';
export { CST_MATCH_RANK, cstMatchRank, filterConstituentaByQuery, matchConstituenta } from './rsform-search';
export { TextMatcher } from './text-matcher';
export { ValueMatcher } from './value-matcher';
