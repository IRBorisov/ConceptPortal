import { useMutation, useQueryClient } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';

import { promptsApi } from './api';
import { type IPromptTemplateDTO, type IUpdatePromptTemplateDTO } from './types';

export function useUpdatePromptTemplate() {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, promptsApi.baseKey, 'update'],
    mutationFn: ({ id, data }: { id: number; data: IUpdatePromptTemplateDTO }) =>
      promptsApi.updatePromptTemplate(id, data),
    onSuccess: (data: IPromptTemplateDTO) => {
      client.setQueryData(promptsApi.getPromptTemplateQueryOptions(data.id).queryKey, data);
      client.setQueryData(promptsApi.getAvailableTemplatesQueryOptions().queryKey, prev =>
        prev?.map(item => (item.id === data.id ? data : item))
      );
    }
  });
  return {
    updatePromptTemplate: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset
  };
}
