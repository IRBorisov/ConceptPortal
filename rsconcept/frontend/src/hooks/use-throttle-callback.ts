'use client';

import { useCallback, useRef } from 'react';

/** Throttles a callback to only run once per delay. */
export function useThrottleCallback<Callback extends (...args: never[]) => void>(
  callback: Callback,
  delay: number
): Callback {
  const lastCalled = useRef(0);

  const throttled = useCallback(
    (...args: Parameters<Callback>) => {
      const now = Date.now();
      if (now - lastCalled.current >= delay) {
        lastCalled.current = now;
        callback(...args);
      }
    },
    [callback, delay]
  );

  return throttled as Callback;
}
