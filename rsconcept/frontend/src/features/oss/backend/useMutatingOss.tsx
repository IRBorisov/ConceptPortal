import { useIsMutating } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';

export const useMutatingOss = () => {
  const countLibrary = useIsMutating({ mutationKey: [KEYS.library] });
  const countOss = useIsMutating({ mutationKey: [KEYS.oss] });
  return countLibrary + countOss !== 0;
};
