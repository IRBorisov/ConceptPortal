import { useMutation, useQueryClient } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';

import { promptsApi } from './api';

export function useCreatePromptTemplate() {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, promptsApi.baseKey, 'create'],
    mutationFn: promptsApi.createPromptTemplate,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: [promptsApi.baseKey] });
    }
  });
  return {
    createPromptTemplate: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset
  };
}
