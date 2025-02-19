'use client';

import { useCallback, useEffect } from 'react';

function useEscapeKey(handleClose: () => void, isEnabled: boolean = true) {
  const handleEscKey = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    },
    [handleClose]
  );

  useEffect(() => {
    if (isEnabled) {
      document.addEventListener('keyup', handleEscKey, false);
      return () => {
        document.removeEventListener('keyup', handleEscKey, false);
      };
    }
  }, [handleEscKey, isEnabled]);
}

export default useEscapeKey;
