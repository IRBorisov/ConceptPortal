import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { CstType } from '../backend/types';

export const graphColorings = ['none', 'status', 'type', 'schemas'] as const;

/**
 * Represents graph node coloring scheme.
 */
export type GraphColoring = (typeof graphColorings)[number];

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
  allowNominal: boolean;
}

export const cstTypeToFilterKey: Record<CstType, keyof GraphFilterParams> = {
  [CstType.BASE]: 'allowBase',
  [CstType.STRUCTURED]: 'allowStruct',
  [CstType.TERM]: 'allowTerm',
  [CstType.AXIOM]: 'allowAxiom',
  [CstType.FUNCTION]: 'allowFunction',
  [CstType.PREDICATE]: 'allowPredicate',
  [CstType.CONSTANT]: 'allowConstant',
  [CstType.THEOREM]: 'allowTheorem',
  [CstType.NOMINAL]: 'allowNominal'
};

interface TermGraphStore {
  filter: GraphFilterParams;
  setFilter: (value: GraphFilterParams) => void;
  toggleFocusInputs: () => void;
  toggleFocusOutputs: () => void;
  toggleText: () => void;
  toggleClustering: () => void;

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
        allowTheorem: true,
        allowNominal: true
      },
      setFilter: value => set({ filter: value }),
      toggleFocusInputs: () =>
        set(state => ({ filter: { ...state.filter, focusShowInputs: !state.filter.focusShowInputs } })),
      toggleFocusOutputs: () =>
        set(state => ({ filter: { ...state.filter, focusShowOutputs: !state.filter.focusShowOutputs } })),
      toggleText: () => set(state => ({ filter: { ...state.filter, noText: !state.filter.noText } })),
      toggleClustering: () => set(state => ({ filter: { ...state.filter, foldDerived: !state.filter.foldDerived } })),

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
