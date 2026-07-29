import { useSuspenseQuery } from '@tanstack/react-query';

import { agentsApi } from './api';

export function useApiKeys() {
  const { data } = useSuspenseQuery(agentsApi.getKeysQueryOptions());
  return { keys: data };
}
