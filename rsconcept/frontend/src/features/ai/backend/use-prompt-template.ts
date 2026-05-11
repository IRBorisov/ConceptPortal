import { useSuspenseQuery } from '@tanstack/react-query';

import { promptsApi } from './api';

export function usePromptTemplate(id: number) {
  const { data } = useSuspenseQuery({
    ...promptsApi.getPromptTemplateQueryOptions(id)
  });
  return { promptTemplate: data };
}
