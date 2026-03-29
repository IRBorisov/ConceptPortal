import { useEffect, useEffectEvent } from 'react';

import { useModificationStore } from '@/stores/modification';

export function useResetModification() {
  const setIsModified = useModificationStore(state => state.setIsModified);
  const onModifiedEvent = useEffectEvent(setIsModified);
  useEffect(function resetGlobalModification() {
    onModifiedEvent(false);
  }, []);
}
