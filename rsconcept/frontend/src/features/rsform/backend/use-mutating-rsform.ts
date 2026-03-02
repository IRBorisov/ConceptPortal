import { useIsMutating } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';

export const useMutatingRSForm = () => {
  const countRsform = useIsMutating({ mutationKey: [KEYS.global_mutation, KEYS.rsform] });
  return countRsform !== 0;
};
