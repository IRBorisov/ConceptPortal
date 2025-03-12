import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { toggleTristateFlag } from '@/utils/utils';

import { type ILibraryFilter, type LocationHead } from '../models/library';

interface LibrarySearchStore {
  folderMode: boolean;
  toggleFolderMode: () => void;

  subfolders: boolean;
  toggleSubfolders: () => void;

  query: string;
  setQuery: (value: string) => void;

  path: string;
  setPath: (value: string) => void;

  location: string;
  setLocation: (value: string) => void;

  head: LocationHead | null;
  setHead: (value: LocationHead | null) => void;

  isVisible: boolean | null;
  toggleVisible: () => void;

  isOwned: boolean | null;
  toggleOwned: () => void;

  isEditor: boolean | null;
  toggleEditor: () => void;

  filterUser: number | null;
  setFilterUser: (value: number | null) => void;

  resetFilter: () => void;
}

export const useLibrarySearchStore = create<LibrarySearchStore>()(
  persist(
    set => ({
      folderMode: true,
      toggleFolderMode: () => set(state => ({ folderMode: !state.folderMode })),

      subfolders: false,
      toggleSubfolders: () => set(state => ({ subfolders: !state.subfolders })),

      query: '',
      setQuery: value => set({ query: value }),

      path: '',
      setPath: value => set({ path: value }),

      location: '',
      setLocation: value => set(!!value ? { location: value, folderMode: true } : { location: '' }),

      head: null,
      setHead: value => set({ head: value }),

      isVisible: true,
      toggleVisible: () => set(state => ({ isVisible: toggleTristateFlag(state.isVisible) })),

      isOwned: null,
      toggleOwned: () => set(state => ({ isOwned: toggleTristateFlag(state.isOwned) })),

      isEditor: null,
      toggleEditor: () => set(state => ({ isEditor: toggleTristateFlag(state.isEditor) })),

      filterUser: null,
      setFilterUser: value => set({ filterUser: value }),

      resetFilter: () =>
        set(() => ({
          query: '',
          path: '',
          location: '',
          head: null,
          isVisible: true,
          isOwned: null,
          isEditor: null,
          filterUser: null
        }))
    }),
    {
      version: 1,
      partialize: state => ({
        folderMode: state.folderMode,
        subfolders: state.subfolders,

        location: state.location,
        head: state.head,
        isVisible: state.isVisible,
        isOwned: state.isOwned,
        isEditor: state.isEditor,
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
  const head = useLibrarySearchStore(state => state.head);
  const isEditor = useLibrarySearchStore(state => state.isEditor);
  const isOwned = useLibrarySearchStore(state => state.isOwned);
  const isVisible = useLibrarySearchStore(state => state.isVisible);
  const filterUser = useLibrarySearchStore(state => state.filterUser);
  const location = useLibrarySearchStore(state => state.location);
  return (
    !!path ||
    !!query ||
    !!location ||
    head !== null ||
    isEditor !== null ||
    isOwned !== null ||
    isVisible !== true ||
    filterUser !== null
  );
}

/** Utility function that returns the current library filter. */
export function useCreateLibraryFilter(): ILibraryFilter {
  const head = useLibrarySearchStore(state => state.head);
  const path = useLibrarySearchStore(state => state.path);
  const query = useLibrarySearchStore(state => state.query);
  const isEditor = useLibrarySearchStore(state => state.isEditor);
  const isOwned = useLibrarySearchStore(state => state.isOwned);
  const isVisible = useLibrarySearchStore(state => state.isVisible);
  const folderMode = useLibrarySearchStore(state => state.folderMode);
  const subfolders = useLibrarySearchStore(state => state.subfolders);
  const location = useLibrarySearchStore(state => state.location);
  const filterUser = useLibrarySearchStore(state => state.filterUser);
  return {
    head: head,
    path: path,
    query: query,
    isEditor: isEditor,
    isOwned: isOwned,
    isVisible: isVisible,
    folderMode: folderMode,
    subfolders: subfolders,
    location: location,
    filterUser: filterUser
  };
}
