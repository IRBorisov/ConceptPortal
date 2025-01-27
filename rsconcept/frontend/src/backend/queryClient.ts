import { QueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { DELAYS } from './configuration';

declare module '@tanstack/react-query' {
  interface Register {
    defaultError: AxiosError;
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: DELAYS.staleDefault,
      gcTime: DELAYS.garbageCollection,
      retry: 3,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true
    }
  }
});
