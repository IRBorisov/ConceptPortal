import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { toggleTristateFlag } from '@/utils/utils';

interface CstSearchStore {
  query: string;
  setQuery: (value: string) => void;

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
      isKernel: false,
      toggleKernel: () => set(state => ({ isKernel: !state.isKernel })),
      isInherited: null,
      toggleInherited: () => set(state => ({ isInherited: toggleTristateFlag(state.isInherited) })),
      isCrucial: null,
      toggleCrucial: () => set(state => ({ isCrucial: toggleTristateFlag(state.isCrucial) }))
    }),
    {
      version: 2,
      partialize: state => ({
        isKernel: state.isKernel,
        isInherited: state.isInherited,
        isCrucial: state.isCrucial
      }),
      name: 'portal.constituenta.search'
    }
  )
);
