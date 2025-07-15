import { useQuery, useSuspenseQuery } from '@tanstack/react-query';

import { queryClient } from '@/backend/query-client';

import { promptsApi } from './api';

export function usePromptTemplate(id: number) {
  const { data, isLoading, error } = useQuery({
    ...promptsApi.getPromptTemplateQueryOptions(id)
  });
  return { promptTemplate: data, isLoading, error };
}

export function usePromptTemplateSuspense(id: number) {
  const { data } = useSuspenseQuery({
    ...promptsApi.getPromptTemplateQueryOptions(id)
  });
  return { promptTemplate: data };
}

export function prefetchPromptTemplate({ itemID }: { itemID: number }) {
  return queryClient.prefetchQuery(promptsApi.getPromptTemplateQueryOptions(itemID));
}
