import { useQuery, useSuspenseQuery } from '@tanstack/react-query';

import { libraryApi } from './api';

export function useTemplatesSuspense() {
  const { data: templates } = useSuspenseQuery({
    ...libraryApi.getTemplatesQueryOptions()
  });
  return { templates };
}

export function useTemplates() {
  const { data: templates } = useQuery({
    ...libraryApi.getTemplatesQueryOptions()
  });
  return { templates: templates ?? [] };
}
