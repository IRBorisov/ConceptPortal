import { useMutation } from '@tanstack/react-query';

import { ossApi } from './api';

export const useFindPredecessor = () => {
  const mutation = useMutation({
    mutationKey: [ossApi.baseKey, 'find-predecessor'],
    mutationFn: ossApi.getPredecessor
  });
  return {
    findPredecessor: (target: number) => mutation.mutateAsync({ target: target })
  };
};
