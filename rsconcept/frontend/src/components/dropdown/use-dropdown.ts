'use client';

import { useRef, useState } from 'react';

import { useClickedOutside } from '@/hooks/use-clicked-outside';

export function useDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useClickedOutside(isOpen, ref, () => setIsOpen(false));

  return {
    ref,
    isOpen,
    setIsOpen,
    toggle: () => setIsOpen(!isOpen),
    hide: () => setIsOpen(false)
  };
}
