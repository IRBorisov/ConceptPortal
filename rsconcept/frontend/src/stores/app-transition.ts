import { create } from 'zustand';

interface TransitionState {
  isNavigating: boolean;
  startNavigation: () => void;
  endNavigation: () => void;
}

export const useAppTransitionStore = create<TransitionState>(set => ({
  isNavigating: false,
  startNavigation: () => set({ isNavigating: true }),
  endNavigation: () => set({ isNavigating: false })
}));
