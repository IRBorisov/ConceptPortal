import { QueryClient } from '@tanstack/react-query';
import { ZodError } from 'zod';

import { AxiosError } from './apiTransport';
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
