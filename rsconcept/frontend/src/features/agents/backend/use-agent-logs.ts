import { useSuspenseQuery } from '@tanstack/react-query';

import { agentsApi } from './api';

export function useAgentLogs(offset: number) {
  const { data } = useSuspenseQuery(agentsApi.getLogsQueryOptions(offset));
  return { logs: data.results, count: data.count };
}
