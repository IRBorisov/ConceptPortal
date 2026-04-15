import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CstFilterOption = 'all' | 'problematic' | 'crucial' | 'kernel' | 'derived' | 'owned' | 'inherited';

interface CstSearchStore {
  query: string;
  setQuery: (value: string) => void;
  reset: () => void;

  filter: CstFilterOption;
  setFilter: (value: CstFilterOption) => void;
  focusProblematic: () => void;
}

type PersistedCstSearchStore = Pick<CstSearchStore, 'filter'>;

export const useCstSearchStore = create<CstSearchStore>()(
  persist<CstSearchStore, [], [], PersistedCstSearchStore>(
    set => ({
      query: '',
      setQuery: value => set({ query: value }),
      reset: () => set(() => ({ query: '', filter: 'all' })),
      filter: 'all',
      setFilter: value => set({ filter: value }),
      focusProblematic: () => set(() => ({ filter: 'problematic', query: '' }))
    }),
    {
      version: 5,
      partialize: state => ({
        filter: state.filter
      }),
      name: 'portal.constituenta.search'
    }
  )
);
