import { describe, expect, it } from 'vitest';

import { AccessPolicy, type LibraryItem, LibraryItemType } from '@rsconcept/domain/library';

import { applyLibraryFilter, type LibraryContextRestriction } from './apply-library-filter';
import { DEFAULT_LIBRARY_CONTEXT_SEARCH_FIELDS } from './library-context-search';
import { type LibraryFilter } from './library-filter';

const user = { id: 1, editor: [] as number[] };

function item(id: number): LibraryItem {
  return {
    id,
    item_type: LibraryItemType.RSFORM,
    alias: `S${id}`,
    title: '',
    description: '',
    visible: true,
    read_only: false,
    location: '/L',
    access_policy: AccessPolicy.PUBLIC,
    time_create: '',
    time_update: '',
    owner: 1
  };
}

function contextFilter(query = 'zebra'): LibraryFilter {
  return {
    query,
    searchMode: 'context',
    contextFields: DEFAULT_LIBRARY_CONTEXT_SEARCH_FIELDS,
    folderMode: false,
    subfolders: false,
    path: '',
    location: '',
    itemType: null,
    isVisible: null,
    isOwned: null,
    isEditor: null,
    filterUser: null
  };
}

describe('applyLibraryFilter context search', () => {
  const items = [item(1), item(2)];

  it('does not show the whole library when context search fails', () => {
    const failed: LibraryContextRestriction = { phase: 'error', matchIds: null };
    expect(applyLibraryFilter(items, contextFilter(), user, failed).map(entry => entry.id)).toEqual([]);
  });

  it('does not keep the previous query while the next one is still running', () => {
    const pending: LibraryContextRestriction = { phase: 'pending', matchIds: [] };
    expect(applyLibraryFilter(items, contextFilter(), user, pending)).toEqual([]);
  });

  it('keeps only ids from a settled response, including an empty one', () => {
    const matched: LibraryContextRestriction = { phase: 'ready', matchIds: [2] };
    expect(applyLibraryFilter(items, contextFilter(), user, matched).map(entry => entry.id)).toEqual([2]);

    const empty: LibraryContextRestriction = { phase: 'ready', matchIds: [] };
    expect(applyLibraryFilter(items, contextFilter(), user, empty)).toEqual([]);
  });

  it('leaves the library unfiltered when there is no context query', () => {
    const idle: LibraryContextRestriction = { phase: 'idle', matchIds: null };
    expect(applyLibraryFilter(items, contextFilter('zebra'), user, idle).map(entry => entry.id)).toEqual([1, 2]);
  });

  it('filters by metadata matching when the search mode is not context', () => {
    const idle: LibraryContextRestriction = { phase: 'idle', matchIds: null };
    const metadata: LibraryFilter = { ...contextFilter('zebra'), searchMode: 'metadata' };
    expect(applyLibraryFilter(items, metadata, user, idle)).toEqual([]);
  });
});
