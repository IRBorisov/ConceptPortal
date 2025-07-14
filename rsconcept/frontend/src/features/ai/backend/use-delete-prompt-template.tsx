import { useMutation, useQueryClient } from '@tanstack/react-query';

import { promptsApi } from './api';

export function useDeletePromptTemplate() {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [promptsApi.baseKey, 'delete'],
    mutationFn: promptsApi.deletePromptTemplate,
    onSuccess: (_data, id) => {
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
