import { useIsMutating } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';

export const useMutatingRSForm = () => {
  const countLibrary = useIsMutating({ mutationKey: [KEYS.library] });
  const countRsform = useIsMutating({ mutationKey: [KEYS.rsform] });
  return countLibrary + countRsform !== 0;
};
