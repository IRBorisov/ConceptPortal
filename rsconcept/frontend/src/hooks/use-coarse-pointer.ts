'use client';

import { useEffect, useState } from 'react';

const COARSE_POINTER_QUERY = '(pointer: coarse)';

/** True when the primary input is a coarse pointer (typically touch). */
export function useCoarsePointer(): boolean {
  const [coarsePointer, setCoarsePointer] = useState(false);

  useEffect(function listenForCoarsePointer() {
    if (typeof window !== 'object' || !window.matchMedia) {
      return;
    }
    const mediaQuery = window.matchMedia(COARSE_POINTER_QUERY);
    function syncCoarsePointer() {
      setCoarsePointer(mediaQuery.matches);
    }
    syncCoarsePointer();
    mediaQuery.addEventListener('change', syncCoarsePointer);
    return () => mediaQuery.removeEventListener('change', syncCoarsePointer);
  }, []);

  return coarsePointer;
}
