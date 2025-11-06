'use client';

import { useCallback, useEffect, useState } from 'react';

import { PARAMETER } from '@/utils/constants';

export function useWindowSize() {
  const isClient = typeof window === 'object';

  const getSize = useCallback(
    () => ({
      width: isClient ? window.innerWidth : undefined,
      height: isClient ? window.innerHeight : undefined,
      isSmall: isClient && window.innerWidth < PARAMETER.smallScreen
    }),
    [isClient]
  );

  const [windowSize, setWindowSize] = useState(getSize);

  useEffect(() => {
    if (!isClient) {
      return;
    }
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
        isSmall: window.innerWidth < PARAMETER.smallScreen
      });
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isClient]);

  return windowSize;
}
