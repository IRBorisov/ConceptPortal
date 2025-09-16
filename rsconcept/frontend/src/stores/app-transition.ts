import { create } from 'zustand';

interface TransitionState {
  isNavigating: boolean;
  startNavigation: () => void;
  endNavigation: () => void;
}

export const useAppTransitionStore = create<TransitionState>(set => ({
  isNavigating: false,
  startNavigation: () => set(state => (state.isNavigating ? state : { isNavigating: true })),
  endNavigation: () => set(state => (!state.isNavigating ? state : { isNavigating: false }))
}));
