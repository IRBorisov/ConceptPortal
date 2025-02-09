import { useIsMutating } from '@tanstack/react-query';

import { cctextApi } from './api';

export const useIsProcessingCctext = () => {
  const countMutations = useIsMutating({ mutationKey: [cctextApi.baseKey] });
  return countMutations !== 0;
};
