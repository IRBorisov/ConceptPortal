import { useMutation, useQueryClient } from '@tanstack/react-query';

import { promptsApi } from './api';

export function useCreatePromptTemplate() {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [promptsApi.baseKey, 'create'],
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
