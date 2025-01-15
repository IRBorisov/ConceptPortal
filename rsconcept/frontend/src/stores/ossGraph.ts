import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OSSGraphStore {
  showGrid: boolean;
  toggleShowGrid: () => void;

  edgeAnimate: boolean;
  toggleEdgeAnimate: () => void;

  edgeStraight: boolean;
  toggleEdgeStraight: () => void;
}

export const useOSSGraphStore = create<OSSGraphStore>()(
  persist(
    set => ({
      showGrid: false,
      toggleShowGrid: () => set(state => ({ showGrid: !state.showGrid })),

      edgeAnimate: false,
      toggleEdgeAnimate: () => set(state => ({ edgeAnimate: !state.edgeAnimate })),

      edgeStraight: false,
      toggleEdgeStraight: () => set(state => ({ edgeStraight: !state.edgeStraight }))
    }),
    {
      version: 1,
      name: 'portal.ossGraph'
    }
  )
);
