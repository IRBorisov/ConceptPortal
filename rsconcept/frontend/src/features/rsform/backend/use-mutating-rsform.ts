import { useIsMutating } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';

export const useMutatingRSForm = () => {
  const countLibrary = useIsMutating({ mutationKey: [KEYS.global_mutation, KEYS.library] });
  const countRsform = useIsMutating({ mutationKey: [KEYS.global_mutation, KEYS.rsform] });
  return countLibrary + countRsform !== 0;
};
