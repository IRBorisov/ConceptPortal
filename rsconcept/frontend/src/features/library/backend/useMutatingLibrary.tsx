import { useIsMutating } from '@tanstack/react-query';

import { ossApi } from '@/features/oss/backend/api';
import { rsformsApi } from '@/features/rsform/backend/api';

import { libraryApi } from './api';

export const useMutatingLibrary = () => {
  const countMutations = useIsMutating({ mutationKey: [libraryApi.baseKey] });
  const countOss = useIsMutating({ mutationKey: [ossApi.baseKey] });
  const countRSForm = useIsMutating({ mutationKey: [rsformsApi.baseKey] });
  return countMutations + countOss + countRSForm !== 0;
};
