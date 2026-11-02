import { describe, expect, it } from 'vitest';

import {
  DEFAULT_LIBRARY_CONTEXT_SEARCH_FIELDS,
  enabledContextSearchFields,
  isDefaultContextSearchFields,
  type LibraryContextSearchSnapshot,
  normalizeContextSearchFields,
  resolveLibraryContextSearch
} from '@/features/library/models/library-context-search';

describe('library context search fields', () => {
  it('defaults to all enabled fields', () => {
    expect(isDefaultContextSearchFields(DEFAULT_LIBRARY_CONTEXT_SEARCH_FIELDS)).toBe(true);
    expect(enabledContextSearchFields(DEFAULT_LIBRARY_CONTEXT_SEARCH_FIELDS)).toHaveLength(9);
  });

  it('normalizes partial persisted state', () => {
    expect(
      normalizeContextSearchFields({
        term: false
      })
    ).toEqual({
      ...DEFAULT_LIBRARY_CONTEXT_SEARCH_FIELDS,
      term: false
    });
  });

  it('does not treat a pending or failed search as the previous query', () => {
    expect(
      resolveLibraryContextSearch(
        searchSnapshot({
          query: 'zebra',
          debouncedQuery: 'apple',
          ids: [1],
          isFetching: true
        })
      )
    ).toEqual({ matchIds: [], isPending: true, phase: 'pending' });

    expect(
      resolveLibraryContextSearch(
        searchSnapshot({
          query: 'zebra',
          debouncedQuery: 'zebra',
          ids: [1],
          isPlaceholder: true,
          isFetching: true
        })
      )
    ).toEqual({ matchIds: [], isPending: true, phase: 'pending' });

    expect(
      resolveLibraryContextSearch(
        searchSnapshot({
          isError: true,
          isFetching: false
        })
      )
    ).toEqual({ matchIds: [], isPending: false, phase: 'error' });
  });

  it('waits for ids before the first search result', () => {
    expect(resolveLibraryContextSearch(searchSnapshot({ isFetching: false }))).toEqual({
      matchIds: [],
      isPending: true,
      phase: 'pending'
    });
  });

  it('keeps ids from the query that has settled', () => {
    expect(
      resolveLibraryContextSearch(
        searchSnapshot({
          ids: [4],
          isFetching: false
        })
      )
    ).toEqual({ matchIds: [4], isPending: false, phase: 'ready' });

    expect(
      resolveLibraryContextSearch(
        searchSnapshot({
          ids: [],
          isFetching: false
        })
      )
    ).toEqual({ matchIds: [], isPending: false, phase: 'ready' });
  });

  it('keeps ids while the current query refetches', () => {
    expect(
      resolveLibraryContextSearch(
        searchSnapshot({
          ids: [4],
          isFetching: true
        })
      )
    ).toEqual({ matchIds: [4], isPending: true, phase: 'ready' });
  });

  it('keeps the last ids when a refetch of the same query fails', () => {
    expect(
      resolveLibraryContextSearch(
        searchSnapshot({
          ids: [4],
          isError: true,
          isFetching: false
        })
      )
    ).toEqual({ matchIds: [4], isPending: false, phase: 'ready' });
  });

  it('does not restrict the library when context search is off', () => {
    expect(resolveLibraryContextSearch(searchSnapshot({ query: '', debouncedQuery: '' }))).toEqual({
      matchIds: null,
      isPending: false,
      phase: 'idle'
    });
  });

  it('returns only enabled fields', () => {
    expect(
      enabledContextSearchFields({
        ...DEFAULT_LIBRARY_CONTEXT_SEARCH_FIELDS,
        title: false,
        block: false
      })
    ).toEqual(['alias', 'description', 'term', 'definition_formal', 'definition_text', 'convention', 'operation']);
  });
});

function searchSnapshot(overrides: Partial<LibraryContextSearchSnapshot>): LibraryContextSearchSnapshot {
  return {
    enabled: true,
    query: 'zebra',
    debouncedQuery: 'zebra',
    activeFieldCount: 2,
    ids: undefined,
    isError: false,
    isFetching: false,
    isPlaceholder: false,
    ...overrides
  };
}
