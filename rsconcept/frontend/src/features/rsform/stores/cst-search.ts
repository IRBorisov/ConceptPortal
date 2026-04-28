import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CstFilterOption =
  | 'all'
  | 'schema_issues'
  | 'model_issues'
  | 'crucial'
  | 'kernel'
  | 'derived'
  | 'owned'
  | 'inherited';

interface CstSearchStore {
  query: string;
  setQuery: (value: string) => void;
  reset: () => void;

  filter: CstFilterOption;
  setFilter: (value: CstFilterOption) => void;
  focusSchemaIssues: () => void;
  focusModelIssues: () => void;
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
      focusSchemaIssues: () => set(() => ({ filter: 'schema_issues', query: '' })),
      focusModelIssues: () => set(() => ({ filter: 'model_issues', query: '' }))
    }),
    {
      version: 7,
      partialize: state => ({
        filter: state.filter
      }),
      name: 'portal.constituenta.search'
    }
  )
);
