import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { GraphColoring, GraphFilterParams } from '@/models/miscellaneous';

interface TermGraphStore {
  filter: GraphFilterParams;
  setFilter: (value: GraphFilterParams) => void;

  foldHidden: boolean;
  toggleFoldHidden: () => void;

  coloring: GraphColoring;
  setColoring: (value: GraphColoring) => void;
}

export const useTermGraphStore = create<TermGraphStore>()(
  persist(
    set => ({
      filter: {
        noTemplates: false,
        noHermits: true,
        noTransitive: true,
        noText: false,
        foldDerived: false,

        focusShowInputs: true,
        focusShowOutputs: true,

        allowBase: true,
        allowStruct: true,
        allowTerm: true,
        allowAxiom: true,
        allowFunction: true,
        allowPredicate: true,
        allowConstant: true,
        allowTheorem: true
      },
      setFilter: value => set({ filter: value }),

      foldHidden: false,
      toggleFoldHidden: () => set(state => ({ foldHidden: !state.foldHidden })),

      coloring: 'type',
      setColoring: value => set({ coloring: value })
    }),
    {
      version: 1,
      name: 'portal.termGraph'
    }
  )
);
