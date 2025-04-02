'use client';

import { useCallback, useEffect } from 'react';

export function useEscapeKey(handleClose: () => void, isEnabled: boolean = true) {
  const handleEscKey = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        handleClose();
      }
    },
    [handleClose]
  );

  useEffect(() => {
    if (isEnabled) {
      document.addEventListener('keydown', handleEscKey, false);
      return () => {
        document.removeEventListener('keydown', handleEscKey, false);
      };
    }
  }, [handleEscKey, isEnabled]);
}
