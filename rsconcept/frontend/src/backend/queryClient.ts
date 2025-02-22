import { QueryClient } from '@tanstack/react-query';
import { type ZodError } from 'zod';

import { type AxiosError } from './apiTransport';
import { DELAYS } from './configuration';

declare module '@tanstack/react-query' {
  interface Register {
    defaultError: AxiosError | ZodError;
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: DELAYS.staleDefault,
      gcTime: DELAYS.garbageCollection,
      retry: false,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true
    }
  }
});
