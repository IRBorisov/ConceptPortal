import { useMutation, useQueryClient } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';

import { agentsApi } from './api';

export function useRevokeApiKey() {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, agentsApi.baseKey, 'revoke-key'],
    mutationFn: agentsApi.revokeKey,
    onSuccess: () => client.invalidateQueries({ queryKey: agentsApi.getKeysQueryOptions().queryKey }),
    onError: () => client.invalidateQueries()
  });
  return {
    revokeKey: mutation.mutateAsync,
    isPending: mutation.isPending
  };
}
