import { useIsMutating } from '@tanstack/react-query';

import { libraryApi } from '@/features/library/backend/api';

import { ossApi } from './api';

export const useMutatingOss = () => {
  const countLibrary = useIsMutating({ mutationKey: [libraryApi.baseKey] });
  const countOss = useIsMutating({ mutationKey: [ossApi.baseKey] });
  return countLibrary + countOss !== 0;
};
