'use client';

import { useCallback, useEffect } from 'react';

function useEscapeKey(handleClose: () => void) {
  const handleEscKey = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    },
    [handleClose]
  );

  useEffect(() => {
    document.addEventListener('keyup', handleEscKey, false);
    return () => {
      document.removeEventListener('keyup', handleEscKey, false);
    };
  }, [handleEscKey]);
}

export default useEscapeKey;
