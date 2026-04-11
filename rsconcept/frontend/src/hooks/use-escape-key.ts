'use client';

import { useEffect, useEffectEvent } from 'react';

export function useEscapeKey(handleClose: () => void, isEnabled: boolean = true) {
  const onCloseEvent = useEffectEvent(handleClose);

  useEffect(
    function listenForEscapeKey() {
      if (!isEnabled) {
        return;
      }

      function handleEscKey(event: KeyboardEvent) {
        if (event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          onCloseEvent();
        }
      }

      document.addEventListener('keydown', handleEscKey, false);
      return () => {
        document.removeEventListener('keydown', handleEscKey, false);
      };
    },
    [isEnabled]
  );
}
