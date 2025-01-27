import { useIsMutating } from '@tanstack/react-query';

import { ossApi } from '../oss/api';
import { rsformsApi } from '../rsform/api';
import { libraryApi } from './api';

export const useIsProcessingLibrary = () => {
  const countMutations = useIsMutating({ mutationKey: [libraryApi.baseKey] });
  const countOss = useIsMutating({ mutationKey: [ossApi.baseKey] });
  const countRSForm = useIsMutating({ mutationKey: [rsformsApi.baseKey] });
  return countMutations + countOss + countRSForm !== 0;
};
