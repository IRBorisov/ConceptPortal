import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { toggleTristateFlag } from '@/utils/utils';

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

  isInherited: boolean | null;
  toggleInherited: () => void;

  isCrucial: boolean | null;
  toggleCrucial: () => void;
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
      isInherited: null,
      toggleInherited: () => set(state => ({ isInherited: toggleTristateFlag(state.isInherited) })),
      isCrucial: null,
      toggleCrucial: () => set(state => ({ isCrucial: toggleTristateFlag(state.isCrucial) }))
    }),
    {
      version: 1,
      partialize: state => ({
        match: state.match,
        source: state.source,
        isInherited: state.isInherited,
        isCrucial: state.isCrucial
      }),
      name: 'portal.constituenta.search'
    }
  )
);
