import { useQuery, useSuspenseQuery } from '@tanstack/react-query';

import { queryClient } from '@/backend/query-client';

import { promptsApi } from './api';

export function useAvailableTemplates() {
  const { data, isLoading, error } = useQuery({
    ...promptsApi.getAvailableTemplatesQueryOptions()
  });
  return { items: data, isLoading, error };
}

export function useAvailableTemplatesSuspense() {
  const { data } = useSuspenseQuery({
    ...promptsApi.getAvailableTemplatesQueryOptions()
  });
  return { items: data };
}

export function prefetchAvailableTemplates() {
  return queryClient.prefetchQuery(promptsApi.getAvailableTemplatesQueryOptions());
}
