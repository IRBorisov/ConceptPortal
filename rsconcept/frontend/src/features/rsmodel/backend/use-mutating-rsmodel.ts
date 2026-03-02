import { useIsMutating } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';

export const useMutatingRSModel = () => {
  const countRsform = useIsMutating({ mutationKey: [KEYS.global_mutation, KEYS.rsform] });
  const countRSmodel = useIsMutating({ mutationKey: [KEYS.global_mutation, KEYS.rsmodel] });
  return countRsform + countRSmodel !== 0;
};
