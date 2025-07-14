import { useMutation, useQueryClient } from '@tanstack/react-query';

import { promptsApi } from './api';
import { type IUpdatePromptTemplateDTO } from './types';

export function useUpdatePromptTemplate() {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [promptsApi.baseKey, 'update'],
    mutationFn: ({ id, data }: { id: number; data: IUpdatePromptTemplateDTO }) =>
      promptsApi.updatePromptTemplate(id, data),
    onSuccess: (_, variables) => {
      void client.invalidateQueries({ queryKey: [promptsApi.baseKey, variables.id] });
    }
  });
  return {
    updatePromptTemplate: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset
  };
}
