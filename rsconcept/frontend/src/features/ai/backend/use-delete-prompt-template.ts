import { useMutation, useQueryClient } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';

import { promptsApi } from './api';

export function useDeletePromptTemplate() {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, promptsApi.baseKey, 'delete'],
    mutationFn: promptsApi.deletePromptTemplate,
    onSuccess: (_, id) => {
      void client.invalidateQueries({ queryKey: [promptsApi.baseKey] });
      void client.invalidateQueries({ queryKey: [promptsApi.baseKey, id] });
    }
  });
  return {
    deletePromptTemplate: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset
  };
}
