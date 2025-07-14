import { useQuery, useSuspenseQuery } from '@tanstack/react-query';

import { promptsApi } from './api';

export function usePromptTemplate(id: number) {
  const { data, isLoading, error } = useQuery({
    ...promptsApi.getPromptTemplateQueryOptions(id)
  });
  return { data, isLoading, error };
}

export function usePromptTemplateSuspense(id: number) {
  const { data } = useSuspenseQuery({
    ...promptsApi.getPromptTemplateQueryOptions(id)
  });
  return { data };
}
