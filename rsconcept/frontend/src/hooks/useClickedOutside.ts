'use client';

import { useEffect } from 'react';

import { assertIsNode } from '@/utils/utils';

function useClickedOutside({ ref, callback }: { ref: React.RefObject<HTMLElement>; callback?: () => void }) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      console.log(1);
      assertIsNode(event.target);
      if (ref.current && !ref.current.contains(event.target)) {
        if (callback) callback();
      }
    }
    document.addEventListener('mouseup', handleClickOutside);
    return () => {
      document.removeEventListener('mouseup', handleClickOutside);
    };
  }, [ref, callback]);
}

export default useClickedOutside;
