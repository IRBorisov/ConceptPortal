import { useEffect } from 'react';

import { useAppTransitionStore } from '@/stores/app-transition';

const DELAY_CACHE_CHECK = 100; // ms

export function useBrowserNavigation() {
  const start = useAppTransitionStore(state => state.startNavigation);
  const end = useAppTransitionStore(state => state.endNavigation);

  useEffect(() => {
    const onPopState = () => {
      start();

      // Fallback to end the navigation in case route completes with cache
      setTimeout(() => {
        end();
      }, DELAY_CACHE_CHECK); // or cancel after Suspense/loader finishes
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [start, end]);
}
