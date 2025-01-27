import { useIsMutating } from '@tanstack/react-query';

import { libraryApi } from '@/backend/library/api';

import { ossApi } from './api';

export const useIsProcessingOss = () => {
  const countLibrary = useIsMutating({ mutationKey: [libraryApi.baseKey] });
  const countOss = useIsMutating({ mutationKey: [ossApi.baseKey] });
  return countLibrary + countOss !== 0;
};
