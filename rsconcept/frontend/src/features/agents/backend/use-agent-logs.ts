import { useSuspenseQuery } from '@tanstack/react-query';

import { agentsApi } from './api';

export function useAgentLogs() {
  const { data } = useSuspenseQuery(agentsApi.getLogsQueryOptions());
  return { logs: data.results, count: data.count };
}
