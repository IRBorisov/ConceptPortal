import { useIsMutating } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';

export const useMutatingLibrary = () => {
  const countMutations = useIsMutating({ mutationKey: [KEYS.library] });
  const countOss = useIsMutating({ mutationKey: [KEYS.oss] });
  const countRSForm = useIsMutating({ mutationKey: [KEYS.rsform] });
  return countMutations + countOss + countRSForm !== 0;
};
