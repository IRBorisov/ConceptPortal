'use client';

import { useRef, useState } from 'react';

import useClickedOutside from './useClickedOutside';

function useDropdown() {
  const [isActive, setIsActive] = useState(false);
  const ref = useRef(null);

  useClickedOutside({ ref, callback: () => setIsActive(false) });

  return {
    ref,
    isActive,
    setIsActive,
    toggle: () => setIsActive(!isActive),
    hide: () => setIsActive(false)
  };
}

export default useDropdown;