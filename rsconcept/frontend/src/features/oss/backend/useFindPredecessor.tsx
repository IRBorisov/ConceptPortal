import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ossApi } from './api';

export const useFindPredecessor = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [ossApi.baseKey, 'find-predecessor'],
    mutationFn: ossApi.getPredecessor,
    onError: () => client.invalidateQueries()
  });
  return {
    findPredecessor: (target: number) => mutation.mutateAsync({ target: target })
  };
};
