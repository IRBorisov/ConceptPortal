import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { LibraryItemType } from '@/domain/library';

import { type LibraryFilter } from '../models/library-filter';

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
          filterUser: null
        }))
    }),
    {
      version: 3,
      migrate: (persisted, fromVersion) => {
        if (fromVersion >= 3 || persisted == null || typeof persisted !== 'object') {
          return persisted as LibrarySearchStore;
        }
        const record = persisted as { state?: { selectorFilter?: unknown } };
        const raw = record.state?.selectorFilter;
        if (typeof raw === 'string') {
          const normalized = raw.toLowerCase();
          record.state = record.state ?? {};
          record.state.selectorFilter = isLibrarySearchSelectorFilter(normalized) ? normalized : 'all';
        }
        return persisted as LibrarySearchStore;
      },
      partialize: state => ({
        subfolders: state.subfolders,

        location: state.location,
        selectorFilter: state.selectorFilter,
        filterUser: state.filterUser
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
  return !!path || !!query || !!location || selectorFilter !== 'all' || filterUser !== null;
}

/** Utility function that returns the current library filter. */
export function useCreateLibraryFilter(): LibraryFilter {
  const query = useLibrarySearchStore(state => state.query);
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
