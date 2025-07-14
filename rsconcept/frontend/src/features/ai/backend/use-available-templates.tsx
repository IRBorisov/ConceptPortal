import { useQuery, useSuspenseQuery } from '@tanstack/react-query';

import { promptsApi } from './api';

export function useAvailableTemplates() {
  const { data, isLoading, error } = useQuery({
    ...promptsApi.getAvailableTemplatesQueryOptions()
  });
  return { data, isLoading, error };
}

export function useAvailableTemplatesSuspense() {
  const { data } = useSuspenseQuery({
    ...promptsApi.getAvailableTemplatesQueryOptions()
  });
  return { data };
}
