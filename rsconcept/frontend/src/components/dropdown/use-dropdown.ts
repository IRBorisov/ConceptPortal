'use client';

import { useRef, useState } from 'react';

export function useDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  function handleBlur(event: React.FocusEvent<HTMLDivElement>) {
    const nextTarget = event.relatedTarget as Node | null;
    if (nextTarget && elementRef.current?.contains(nextTarget)) {
      return;
    }

    // Keep open when focus moves into a popover (e.g., ComboBox menu rendered via portal)
    if (
      nextTarget instanceof Element &&
      (nextTarget.closest("[data-slot='popover-content']") || nextTarget.closest("[data-slot='popover-trigger']"))
    ) {
      return;
    }
    setIsOpen(false);
  }

  return {
    elementRef,
    isOpen,
    setIsOpen,
    handleBlur,
    toggle: () => setIsOpen(!isOpen),
    hide: () => setIsOpen(false)
  };
}
