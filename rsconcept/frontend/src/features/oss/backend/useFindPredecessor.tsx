import { useMutation } from '@tanstack/react-query';

import { ITargetCst } from '@/features/rsform/models/rsform';

import { ossApi } from './api';

export const useFindPredecessor = () => {
  const mutation = useMutation({
    mutationKey: [ossApi.baseKey, 'find-predecessor'],
    mutationFn: ossApi.getPredecessor
  });
  return {
    findPredecessor: (data: ITargetCst) => mutation.mutateAsync(data)
  };
};
