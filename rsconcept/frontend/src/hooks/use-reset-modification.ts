import { useEffect } from 'react';

import { useModificationStore } from '@/stores/modification';

export function useResetModification() {
  const setIsModified = useModificationStore(state => state.setIsModified);

  useEffect(() => {
    setIsModified(false);
  }, [setIsModified]);
}
