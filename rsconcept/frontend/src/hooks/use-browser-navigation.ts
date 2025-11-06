import { useEffect } from 'react';

import { useAppTransitionStore } from '@/stores/app-transition';

const DELAY_CACHE_CHECK = 100; // ms

export function useBrowserNavigation() {
  const start = useAppTransitionStore(state => state.startNavigation);
  const end = useAppTransitionStore(state => state.endNavigation);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const onPopState = () => {
      start();

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Fallback to end the navigation in case route completes with cache
      timeoutId = setTimeout(() => {
        end();
        timeoutId = null;
      }, DELAY_CACHE_CHECK);
    };

    window.addEventListener('popstate', onPopState);
    return () => {
      window.removeEventListener('popstate', onPopState);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [start, end]);
}
