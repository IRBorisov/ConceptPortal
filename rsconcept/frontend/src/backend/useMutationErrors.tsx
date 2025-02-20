import { useState } from 'react';
import { useMutationState } from '@tanstack/react-query';

import { KEYS } from './configuration';

export const useMutationErrors = () => {
  const [ignored, setIgnored] = useState<Error[]>([]);
  const mutationErrors = useMutationState({
    filters: { mutationKey: [KEYS.global_mutation], status: 'error' },
    select: mutation => mutation.state.error!
  });

  function resetErrors() {
    setIgnored(mutationErrors);
  }

  return { mutationErrors: mutationErrors.filter(error => !ignored.includes(error)), resetErrors };
};
