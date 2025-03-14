import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** Represents graph dependency mode. */
export const DependencyMode = {
  ALL: 0,
  OUTPUTS: 1,
  INPUTS: 2,
  EXPAND_OUTPUTS: 3,
  EXPAND_INPUTS: 4
} as const;
export type DependencyMode = (typeof DependencyMode)[keyof typeof DependencyMode];

/** Represents {@link IConstituenta} matching mode. */
export const CstMatchMode = {
  ALL: 1,
  EXPR: 2,
  TERM: 3,
  TEXT: 4,
  NAME: 5
} as const;
export type CstMatchMode = (typeof CstMatchMode)[keyof typeof CstMatchMode];

interface CstSearchStore {
  query: string;
  setQuery: (value: string) => void;

  match: CstMatchMode;
  setMatch: (value: CstMatchMode) => void;

  source: DependencyMode;
  setSource: (value: DependencyMode) => void;

  includeInherited: boolean;
  toggleInherited: () => void;
}

export const useCstSearchStore = create<CstSearchStore>()(
  persist(
    set => ({
      query: '',
      setQuery: value => set({ query: value }),
      match: CstMatchMode.ALL,
      setMatch: value => set({ match: value }),
      source: DependencyMode.ALL,
      setSource: value => set({ source: value }),
      includeInherited: true,
      toggleInherited: () => set(state => ({ includeInherited: !state.includeInherited }))
    }),
    {
      version: 1,
      partialize: state => ({
        match: state.match,
        source: state.source,
        includeInherited: state.includeInherited
      }),
      name: 'portal.constituenta.search'
    }
  )
);
