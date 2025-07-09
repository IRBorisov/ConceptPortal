import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Represents graph node coloring scheme.
 */
export type GraphColoring = 'none' | 'status' | 'type' | 'schemas';

/**
 * Represents parameters for GraphEditor.
 */
export interface GraphFilterParams {
  noHermits: boolean;
  noTransitive: boolean;
  noTemplates: boolean;
  noText: boolean;
  foldDerived: boolean;

  focusShowInputs: boolean;
  focusShowOutputs: boolean;

  allowBase: boolean;
  allowStruct: boolean;
  allowTerm: boolean;
  allowAxiom: boolean;
  allowFunction: boolean;
  allowPredicate: boolean;
  allowConstant: boolean;
  allowTheorem: boolean;
}

interface TermGraphStore {
  filter: GraphFilterParams;
  setFilter: (value: GraphFilterParams) => void;
  toggleFocusInputs: () => void;
  toggleFocusOutputs: () => void;

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
      toggleFocusInputs: () =>
        set(state => ({ filter: { ...state.filter, focusShowInputs: !state.filter.focusShowInputs } })),
      toggleFocusOutputs: () =>
        set(state => ({ filter: { ...state.filter, focusShowOutputs: !state.filter.focusShowOutputs } })),

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
