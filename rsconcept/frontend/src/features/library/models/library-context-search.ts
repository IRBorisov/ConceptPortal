/**
 * Context search field toggles for library items.
 */

export type LibraryContextSearchField =
  | 'alias'
  | 'title'
  | 'description'
  | 'term'
  | 'definition_formal'
  | 'definition_text'
  | 'convention'
  | 'operation'
  | 'block';

export type LibraryContextSearchFields = Record<LibraryContextSearchField, boolean>;

export const LIBRARY_CONTEXT_SEARCH_FIELDS: readonly LibraryContextSearchField[] = [
  'alias',
  'title',
  'description',
  'term',
  'definition_formal',
  'definition_text',
  'convention',
  'operation',
  'block'
];

export const DEFAULT_LIBRARY_CONTEXT_SEARCH_FIELDS: LibraryContextSearchFields = {
  alias: true,
  title: true,
  description: true,
  term: true,
  definition_formal: true,
  definition_text: true,
  convention: true,
  operation: true,
  block: true
};

export type LibraryContextSearchPhase = 'idle' | 'pending' | 'error' | 'ready';

export interface LibraryContextSearchSnapshot {
  enabled: boolean;
  query: string;
  debouncedQuery: string;
  activeFieldCount: number;
  /** Ids for the debounced query. Absent until that query settles. */
  ids: number[] | undefined;
  isError: boolean;
  isFetching: boolean;
  /** True when `ids` were kept from a previous query key. */
  isPlaceholder: boolean;
}

export interface LibraryContextSearchView {
  matchIds: number[] | null;
  isPending: boolean;
  phase: LibraryContextSearchPhase;
}

/**
 * Ids that belong to the query currently in the field.
 * A pending or failed request does not reuse the previous query's ids, and it does not mean "no filter".
 */
export function resolveLibraryContextSearch(snapshot: LibraryContextSearchSnapshot): LibraryContextSearchView {
  const trimmed = snapshot.query.trim();
  const debounced = snapshot.debouncedQuery.trim();
  const searching = snapshot.enabled && trimmed.length > 0;

  if (!searching) {
    return { matchIds: null, isPending: false, phase: 'idle' };
  }
  if (snapshot.activeFieldCount === 0) {
    return { matchIds: [], isPending: false, phase: 'ready' };
  }

  const waitingForCurrent =
    trimmed !== debounced ||
    snapshot.isPlaceholder ||
    (snapshot.ids === undefined && !snapshot.isError);
  if (waitingForCurrent) {
    return { matchIds: [], isPending: true, phase: 'pending' };
  }
  if (snapshot.isError && snapshot.ids === undefined) {
    return { matchIds: [], isPending: false, phase: 'error' };
  }

  return {
    matchIds: snapshot.ids ?? [],
    isPending: snapshot.isFetching,
    phase: 'ready'
  };
}

export function enabledContextSearchFields(fields: LibraryContextSearchFields): LibraryContextSearchField[] {
  return LIBRARY_CONTEXT_SEARCH_FIELDS.filter(field => fields[field]);
}

export function isDefaultContextSearchFields(fields: LibraryContextSearchFields): boolean {
  return LIBRARY_CONTEXT_SEARCH_FIELDS.every(field => fields[field]);
}

export function normalizeContextSearchFields(
  fields: Partial<LibraryContextSearchFields> | undefined
): LibraryContextSearchFields {
  return {
    alias: fields?.alias ?? true,
    title: fields?.title ?? true,
    description: fields?.description ?? true,
    term: fields?.term ?? true,
    definition_formal: fields?.definition_formal ?? true,
    definition_text: fields?.definition_text ?? true,
    convention: fields?.convention ?? true,
    operation: fields?.operation ?? true,
    block: fields?.block ?? true
  };
}
