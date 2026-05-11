import { useSuspenseQuery } from '@tanstack/react-query';

import { queryClient } from '@/backend/query-client';

import { promptsApi } from './api';

export function useAvailableTemplates() {
  const { data } = useSuspenseQuery({
    ...promptsApi.getAvailableTemplatesQueryOptions()
  });
  return { items: data };
}

export function prefetchAvailableTemplates() {
  return queryClient.prefetchQuery(promptsApi.getAvailableTemplatesQueryOptions());
}
