import { create } from 'zustand';

import { PARAMETER } from '@/utils/constants';

/** Application layout state manager. */
interface AppLayoutStore {
  noNavigation: boolean;
  noNavigationAnimation: boolean;
  toggleNoNavigation: () => void;

  noFooter: boolean;
  hideFooter: (value?: boolean) => void;
}

export const useAppLayoutStore = create<AppLayoutStore>()(set => ({
  noNavigation: false,
  noNavigationAnimation: false,
  toggleNoNavigation: () =>
    set(state => {
      if (state.noNavigation) {
        return { noNavigation: false, noNavigationAnimation: false };
      } else {
        setTimeout(() => set({ noNavigation: true, noNavigationAnimation: true }), PARAMETER.moveDuration);
        return { noNavigation: false, noNavigationAnimation: true };
      }
    }),

  noFooter: false,
  hideFooter: value => set({ noFooter: value ?? true })
}));

/** Utility function that returns the height of the main area. */
export function useMainHeight(): string {
  const noNavigation = useAppLayoutStore(state => state.noNavigation);
  const noFooter = useAppLayoutStore(state => state.noFooter);
  if (noNavigation) {
    return '100dvh';
  } else if (noFooter) {
    return 'calc(100dvh - 3rem)';
  } else {
    return 'calc(100dvh - 6.75rem)';
  }
}

/** Utility function that returns the height of the viewport. */
export function useViewportHeight(): string {
  const noNavigation = useAppLayoutStore(state => state.noNavigation);
  return !noNavigation ? 'calc(100dvh - 3rem)' : '100dvh';
}

/** Utility function that returns the height of the viewport with a given offset. */
export function useFitHeight(offset: string, minimum: string = '0px'): string {
  const noNavigation = useAppLayoutStore(state => state.noNavigation);
  const noFooter = useAppLayoutStore(state => state.noFooter);
  if (noNavigation) {
    return `max(calc(100dvh - (${offset})), ${minimum})`;
  } else if (noFooter) {
    return `max(calc(100dvh - 3rem - (${offset})), ${minimum})`;
  } else {
    return `max(calc(100dvh - 6.75rem - (${offset})), ${minimum})`;
  }
}
