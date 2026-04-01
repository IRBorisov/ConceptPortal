import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { toggleTristateFlag } from '@/utils/utils';

/** Represents {@link Constituenta} matching mode. */
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

  isKernel: boolean;
  toggleKernel: () => void;

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
      isKernel: false,
      toggleKernel: () => set(state => ({ isKernel: !state.isKernel })),
      isInherited: null,
      toggleInherited: () => set(state => ({ isInherited: toggleTristateFlag(state.isInherited) })),
      isCrucial: null,
      toggleCrucial: () => set(state => ({ isCrucial: toggleTristateFlag(state.isCrucial) }))
    }),
    {
      version: 1,
      partialize: state => ({
        match: state.match,
        isKernel: state.isKernel,
        isInherited: state.isInherited,
        isCrucial: state.isCrucial
      }),
      name: 'portal.constituenta.search'
    }
  )
);
