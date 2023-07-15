import { useEffect } from 'react';
import { assertIsNode } from '../utils';

export function useClickedOutside({ref, callback}: {ref: React.RefObject<HTMLElement>, callback: Function}) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      assertIsNode(event.target);
      if (ref.current && !ref.current.contains(event.target)) {
        callback()
      }
    }
    document.addEventListener('mouseup', handleClickOutside);
    return () => {
      document.removeEventListener('mouseup', handleClickOutside);
    };
  }, [ref, callback]);
};