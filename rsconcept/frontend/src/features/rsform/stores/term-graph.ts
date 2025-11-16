import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { CstType } from '../backend/types';

/** Represents graph editing mode mode. */
export const InteractionMode = {
  explore: 'explore',
  edit: 'edit'
} as const;
export type InteractionMode = (typeof InteractionMode)[keyof typeof InteractionMode];

/** Represents graph node coloring scheme. */
export const TGColoring = {
  none: 'none',
  status: 'status',
  type: 'type',
  schemas: 'schemas'
} as const;
export type TGColoring = (typeof TGColoring)[keyof typeof TGColoring];

/** Represents graph edge type. */
export const TGEdgeType = {
  full: 'full',
  definition: 'definition',
  attribution: 'attribution'
} as const;
export type TGEdgeType = (typeof TGEdgeType)[keyof typeof TGEdgeType];

/** Represents parameters for GraphEditor. */
export interface GraphFilterParams {
  graphType: TGEdgeType;

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
  setGraphType: (value: TGEdgeType) => void;
  toggleFocusInputs: () => void;
  toggleFocusOutputs: () => void;
  toggleText: () => void;
  toggleClustering: () => void;
  toggleGraphType: () => void;

  foldHidden: boolean;
  toggleFoldHidden: () => void;

  coloring: TGColoring;
  setColoring: (value: TGColoring) => void;

  mode: InteractionMode;
  setMode: (value: InteractionMode) => void;
  toggleMode: () => void;
}

interface TGConnectionStore {
  connectionType: TGEdgeType;
  setConnectionType: (value: TGEdgeType) => void;
  toggleConnectionType: () => void;

  start: string | null;
  setStart: (value: string | null) => void;
}

export const useTermGraphStore = create<TermGraphStore>()(
  persist(
    set => ({
      filter: {
        graphType: TGEdgeType.full,

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
      setGraphType: value => set(state => ({ filter: { ...state.filter, graphType: value } })),
      toggleFocusInputs: () =>
        set(state => ({ filter: { ...state.filter, focusShowInputs: !state.filter.focusShowInputs } })),
      toggleFocusOutputs: () =>
        set(state => ({ filter: { ...state.filter, focusShowOutputs: !state.filter.focusShowOutputs } })),
      toggleText: () => set(state => ({ filter: { ...state.filter, noText: !state.filter.noText } })),
      toggleClustering: () => set(state => ({ filter: { ...state.filter, foldDerived: !state.filter.foldDerived } })),
      toggleGraphType: () =>
        set(state => ({
          filter: {
            ...state.filter,
            graphType:
              state.filter.graphType === TGEdgeType.full
                ? TGEdgeType.attribution
                : state.filter.graphType === TGEdgeType.attribution
                ? TGEdgeType.definition
                : TGEdgeType.full
          }
        })),

      foldHidden: false,
      toggleFoldHidden: () => set(state => ({ foldHidden: !state.foldHidden })),

      coloring: 'type',
      setColoring: value => set({ coloring: value }),

      mode: InteractionMode.explore,
      setMode: value => set({ mode: value }),
      toggleMode: () =>
        set(state => ({
          mode: state.mode === InteractionMode.explore ? InteractionMode.edit : InteractionMode.explore
        }))
    }),
    {
      version: 5,
      name: 'portal.termGraph'
    }
  )
);

export const useTGConnectionStore = create<TGConnectionStore>()(set => ({
  connectionType: TGEdgeType.attribution,
  setConnectionType: value => set({ connectionType: value }),
  toggleConnectionType: () =>
    set(state => ({
      connectionType: state.connectionType === TGEdgeType.attribution ? TGEdgeType.definition : TGEdgeType.attribution
    })),
  start: null,
  setStart: value => set({ start: value })
}));
