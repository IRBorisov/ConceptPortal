'use client';

import { useRef, useState } from 'react';

import useClickedOutside from './useClickedOutside';

function useDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useClickedOutside({ ref, callback: () => setIsOpen(false) });

  return {
    ref,
    isOpen,
    setIsOpen,
    toggle: () => setIsOpen(!isOpen),
    hide: () => setIsOpen(false)
  };
}

export default useDropdown;