import { useEffect, useEffectEvent } from 'react';

import { useModificationStore } from '@/stores/modification';

/** Clears the global "modified" flag on mount (e.g. when opening a fresh editor view). */
export function useResetModification() {
  const setIsModified = useModificationStore(state => state.setIsModified);
  const onModifiedEvent = useEffectEvent(setIsModified);
  useEffect(function resetGlobalModification() {
    onModifiedEvent(false);
  }, []);
}
