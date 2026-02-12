import { useQuery, useSuspenseQuery } from '@tanstack/react-query';

import { queryClient } from '@/backend/query-client';

import { rsformsApi } from './api';

export function useRSModel({ itemID }: { itemID?: number; }) {
  const { data, isLoading, error } = useQuery({
    ...rsformsApi.getRSModelQueryOptions({ itemID })
  });
  return { model: data, isLoading, error };
}

export function useRSModelSuspense({ itemID }: { itemID: number; }) {
  const { data } = useSuspenseQuery({
    ...rsformsApi.getRSModelQueryOptions({ itemID })
  });
  return { model: data };
}

export function prefetchRSModel({ itemID }: { itemID?: number; }) {
  if (!itemID) {
    return null;
  }
  return queryClient.prefetchQuery(rsformsApi.getRSModelQueryOptions({ itemID }));
}
