import { useIsMutating } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';

export const useIsProcessingCctext = () => {
  const countMutations = useIsMutating({ mutationKey: [KEYS.cctext] });
  return countMutations !== 0;
};
