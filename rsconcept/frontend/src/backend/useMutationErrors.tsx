import { useState } from 'react';
import { useMutationState, useQueryClient } from '@tanstack/react-query';

import { KEYS } from './configuration';

export const useMutationErrors = () => {
  const queryClient = useQueryClient();
  const [ignored, setIgnored] = useState<(Error | null)[]>([]);
  const mutationErrors = useMutationState({
    filters: { mutationKey: [KEYS.global_mutation], status: 'error' },
    select: mutation => mutation.state.error
  });

  console.log(queryClient.getMutationCache().getAll());

  function resetErrors() {
    setIgnored(mutationErrors);
  }

  return { mutationErrors: mutationErrors.filter(error => !ignored.includes(error)), resetErrors };
};
