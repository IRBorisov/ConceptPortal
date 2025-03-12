'use client';

import { useEffect } from 'react';

import { assertIsNode } from '@/utils/utils';

export function useClickedOutside(
  enabled: boolean,
  ref: React.RefObject<HTMLDivElement | null>,
  callback?: () => void
) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      assertIsNode(event.target);
      if (ref?.current && !ref.current.contains(event.target)) {
        callback?.();
      }
    }
    document.addEventListener('mouseup', handleClickOutside);
    return () => {
      document.removeEventListener('mouseup', handleClickOutside);
    };
  }, [ref, callback, enabled]);
}
