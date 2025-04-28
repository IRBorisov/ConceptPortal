import { useRef } from 'react';

import { useModificationStore } from '@/stores/modification';

export function useResetModification() {
  const { setIsModified } = useModificationStore();
  const initialized = useRef(false);

  if (!initialized.current) {
    initialized.current = true;
    setIsModified(false);
  }
}
