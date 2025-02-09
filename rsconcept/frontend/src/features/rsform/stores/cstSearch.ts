import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Represents graph dependency mode.
 */
export enum DependencyMode {
  ALL = 0,
  OUTPUTS,
  INPUTS,
  EXPAND_OUTPUTS,
  EXPAND_INPUTS
}

/**
 * Represents {@link IConstituenta} matching mode.
 */
export enum CstMatchMode {
  ALL = 1,
  EXPR,
  TERM,
  TEXT,
  NAME
}

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
