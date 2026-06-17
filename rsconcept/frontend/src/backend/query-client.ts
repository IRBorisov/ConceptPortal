import { QueryClient } from '@tanstack/react-query';
import { isCancel } from 'axios';
import { type ZodError } from 'zod';

import { type AxiosError, isAxiosError } from './api-transport';
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
      retry: shouldRetryQuery,
      retryDelay: getRetryDelay,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true
    }
  }
});

export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  return failureCount < 2 && isTransientNetworkError(error);
}

export function getRetryDelay(attemptIndex: number): number {
  return Math.min(DELAYS.queryRetryBase * 2 ** attemptIndex, DELAYS.queryRetryMax);
}

export function isTransientNetworkError(error: unknown): boolean {
  if (isCancel(error)) {
    return false;
  }
  return isAxiosError(error) && !error.response;
}
