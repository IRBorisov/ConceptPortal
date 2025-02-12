import { useIsMutating } from '@tanstack/react-query';

import { libraryApi } from '@/features/library';

import { rsformsApi } from './api';

export const useMutatingRSForm = () => {
  const countLibrary = useIsMutating({ mutationKey: [libraryApi.baseKey] });
  const countRsform = useIsMutating({ mutationKey: [rsformsApi.baseKey] });
  return countLibrary + countRsform !== 0;
};
