import { useMutation, useQueryClient } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';

import { agentsApi } from './api';

export function useCreateApiKey() {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, agentsApi.baseKey, 'create-key'],
    mutationFn: agentsApi.createKey,
    onSuccess: () => client.invalidateQueries({ queryKey: agentsApi.getKeysQueryOptions().queryKey }),
    onError: () => client.invalidateQueries()
  });
  return {
    createKey: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset
  };
}
