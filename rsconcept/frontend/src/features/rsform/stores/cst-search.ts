import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { toggleTristateFlag } from '@/utils/utils';

interface CstSearchStore {
  query: string;
  setQuery: (value: string) => void;

  isKernel: boolean;
  toggleKernel: () => void;

  isProblematic: boolean;
  toggleProblematic: () => void;
  focusProblematic: () => void;

  isInherited: boolean | null;
  toggleInherited: () => void;

  isCrucial: boolean | null;
  toggleCrucial: () => void;
}

type PersistedCstSearchStore = Pick<CstSearchStore, 'isKernel' | 'isProblematic' | 'isInherited' | 'isCrucial'>;

export const useCstSearchStore = create<CstSearchStore>()(
  persist<CstSearchStore, [], [], PersistedCstSearchStore>(
    set => ({
      query: '',
      setQuery: value => set({ query: value }),
      isKernel: false,
      toggleKernel: () => set(state => ({ isKernel: !state.isKernel })),
      isProblematic: false,
      toggleProblematic: () => set(state => ({ isProblematic: !state.isProblematic })),
      focusProblematic: () =>
        set(() => ({ isProblematic: true, query: '', isKernel: false, isInherited: null, isCrucial: null })),
      isInherited: null,
      toggleInherited: () => set(state => ({ isInherited: toggleTristateFlag(state.isInherited) })),
      isCrucial: null,
      toggleCrucial: () => set(state => ({ isCrucial: toggleTristateFlag(state.isCrucial) }))
    }),
    {
      version: 3,
      partialize: state => ({
        isKernel: state.isKernel,
        isProblematic: state.isProblematic,
        isInherited: state.isInherited,
        isCrucial: state.isCrucial
      }),
      name: 'portal.constituenta.search'
    }
  )
);
