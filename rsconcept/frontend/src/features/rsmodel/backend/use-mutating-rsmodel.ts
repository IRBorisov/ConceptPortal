import { useIsMutating } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';

export const useMutatingRSModel = () => {
  const countLibrary = useIsMutating({ mutationKey: [KEYS.global_mutation, KEYS.library] });
  const countRsform = useIsMutating({ mutationKey: [KEYS.global_mutation, KEYS.rsform] });
  const countRSmodel = useIsMutating({ mutationKey: [KEYS.global_mutation, KEYS.rsmodel] });
  return countLibrary + countRsform + countRSmodel !== 0;
};
