import { useIsMutating } from '@tanstack/react-query';

import { libraryApi } from '@/backend/library/api';

import { rsformsApi } from './api';

export const useIsProcessingRSForm = () => {
  const countLibrary = useIsMutating({ mutationKey: [libraryApi.baseKey] });
  const countRsform = useIsMutating({ mutationKey: [rsformsApi.baseKey] });
  return countLibrary + countRsform !== 0;
};
