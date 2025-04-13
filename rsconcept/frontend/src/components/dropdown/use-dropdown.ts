'use client';

import { useRef, useState } from 'react';

export function useDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  function handleBlur(event: React.FocusEvent<HTMLDivElement>) {
    if (ref.current?.contains(event.relatedTarget as Node)) {
      return;
    }
    setIsOpen(false);
  }

  return {
    ref,
    isOpen,
    setIsOpen,
    handleBlur,
    toggle: () => setIsOpen(!isOpen),
    hide: () => setIsOpen(false)
  };
}
