import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { LibraryItemType } from '@rsconcept/domain/library';

import {
  DEFAULT_LIBRARY_CONTEXT_SEARCH_FIELDS,
  isDefaultContextSearchFields,
  type LibraryContextSearchField,
  type LibraryContextSearchFields,
  normalizeContextSearchFields
} from '../models/library-context-search';
import { type LibraryFilter, type LibrarySearchMode } from '../models/library-filter';

export type LibrarySearchSelectorFilter =
  | 'all'
  | 'hidden'
  | 'owner_me'
  | 'editor_me'
  | 'type_rsform'
  | 'type_oss'
  | 'type_rsmodel';

const LIBRARY_SELECTOR_FILTERS: readonly LibrarySearchSelectorFilter[] = [
  'all',
  'hidden',
  'owner_me',
  'editor_me',
  'type_rsform',
  'type_oss',
  'type_rsmodel'
];

function isLibrarySearchSelectorFilter(value: string): value is LibrarySearchSelectorFilter {
  return (LIBRARY_SELECTOR_FILTERS as readonly string[]).includes(value);
}

interface LibrarySearchStore {
  subfolders: boolean;
  toggleSubfolders: () => void;

  query: string;
  setQuery: (value: string) => void;

  searchMode: LibrarySearchMode;
  setSearchMode: (value: LibrarySearchMode) => void;

  contextFields: LibraryContextSearchFields;
  setContextField: (field: LibraryContextSearchField, enabled: boolean) => void;
  resetContextFields: () => void;

  path: string;
  setPath: (value: string) => void;

  location: string;
  setLocation: (value: string) => void;

  selectorFilter: LibrarySearchSelectorFilter;
  setSelectorFilter: (value: LibrarySearchSelectorFilter) => void;

  filterUser: number | null;
  setFilterUser: (value: number | null) => void;

  resetFilter: () => void;
}

export const useLibrarySearchStore = create<LibrarySearchStore>()(
  persist(
    set => ({
      subfolders: false,
      toggleSubfolders: () => set(state => ({ subfolders: !state.subfolders })),

      query: '',
      setQuery: value => set({ query: value }),

      searchMode: 'metadata',
      setSearchMode: value => set({ searchMode: value }),

      contextFields: { ...DEFAULT_LIBRARY_CONTEXT_SEARCH_FIELDS },
      setContextField: (field, enabled) =>
        set(state => ({
          contextFields: { ...state.contextFields, [field]: enabled }
        })),
      resetContextFields: () => set({ contextFields: { ...DEFAULT_LIBRARY_CONTEXT_SEARCH_FIELDS } }),

      path: '',
      setPath: value => set({ path: value }),

      location: '',
      setLocation: value => set(!!value ? { location: value } : { location: '' }),

      selectorFilter: 'all',
      setSelectorFilter: value => set({ selectorFilter: value }),

      filterUser: null,
      setFilterUser: value => set({ filterUser: value }),

      resetFilter: () =>
        set(() => ({
          query: '',
          path: '',
          location: '',
          selectorFilter: 'all',
          filterUser: null,
          searchMode: 'metadata',
          contextFields: { ...DEFAULT_LIBRARY_CONTEXT_SEARCH_FIELDS }
        }))
    }),
    {
      version: 4,
      migrate: (persisted, fromVersion) => {
        if (persisted == null || typeof persisted !== 'object') {
          return persisted as LibrarySearchStore;
        }
        const record = persisted as { state?: Partial<LibrarySearchStore> };
        record.state = record.state ?? {};

        if (fromVersion < 3) {
          const raw = record.state.selectorFilter;
          if (typeof raw === 'string') {
            const normalized = raw.toLowerCase();
            record.state.selectorFilter = isLibrarySearchSelectorFilter(normalized) ? normalized : 'all';
          }
        }
        if (fromVersion < 4) {
          record.state.searchMode = 'metadata';
          record.state.contextFields = normalizeContextSearchFields(record.state.contextFields);
        }
        return persisted as LibrarySearchStore;
      },
      partialize: state => ({
        subfolders: state.subfolders,
        location: state.location,
        selectorFilter: state.selectorFilter,
        filterUser: state.filterUser,
        searchMode: state.searchMode,
        contextFields: state.contextFields
      }),
      name: 'portal.library.search'
    }
  )
);

/** Utility function that indicates if custom filter is set. */
export function useHasCustomFilter(): boolean {
  const path = useLibrarySearchStore(state => state.path);
  const query = useLibrarySearchStore(state => state.query);
  const selectorFilter = useLibrarySearchStore(state => state.selectorFilter);
  const filterUser = useLibrarySearchStore(state => state.filterUser);
  const location = useLibrarySearchStore(state => state.location);
  const searchMode = useLibrarySearchStore(state => state.searchMode);
  const contextFields = useLibrarySearchStore(state => state.contextFields);
  return (
    !!path ||
    !!query ||
    !!location ||
    selectorFilter !== 'all' ||
    filterUser !== null ||
    searchMode !== 'metadata' ||
    !isDefaultContextSearchFields(contextFields)
  );
}

/** Utility function that returns the current library filter. */
export function useCreateLibraryFilter(): LibraryFilter {
  const query = useLibrarySearchStore(state => state.query);
  const searchMode = useLibrarySearchStore(state => state.searchMode);
  const contextFields = useLibrarySearchStore(state => state.contextFields);
  const selectorFilter = useLibrarySearchStore(state => state.selectorFilter);
  const subfolders = useLibrarySearchStore(state => state.subfolders);
  const location = useLibrarySearchStore(state => state.location);
  const filterUser = useLibrarySearchStore(state => state.filterUser);

  let itemType: LibraryItemType | null = null;
  let isVisible: boolean | null = true;
  let isOwned: boolean | null = null;
  let isEditor: boolean | null = null;

  if (selectorFilter === 'hidden') {
    isVisible = false;
  } else if (selectorFilter === 'owner_me') {
    isOwned = true;
  } else if (selectorFilter === 'editor_me') {
    isEditor = true;
  } else if (selectorFilter === 'type_rsform') {
    itemType = LibraryItemType.RSFORM;
  } else if (selectorFilter === 'type_oss') {
    itemType = LibraryItemType.OSS;
  } else if (selectorFilter === 'type_rsmodel') {
    itemType = LibraryItemType.RSMODEL;
  }

  return {
    query: query,
    searchMode: searchMode,
    contextFields: contextFields,
    itemType: itemType,
    isEditor: isEditor,
    isOwned: isOwned,
    isVisible: isVisible,
    folderMode: true,
    subfolders: subfolders,
    location: location,
    path: '',
    filterUser: filterUser
  };
}
