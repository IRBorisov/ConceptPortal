import { useSuspenseQuery } from '@tanstack/react-query';

import { queryClient } from '@/backend/query-client';

import { rsmodelApi } from './api';

export function useRSModel({ itemID }: { itemID: number }) {
  const { data } = useSuspenseQuery({
    ...rsmodelApi.getRSModelQueryOptions({ itemID })
  });
  return { model: data };
}

export function prefetchRSModel({ itemID }: { itemID?: number }) {
  if (!itemID) {
    return null;
  }
  return queryClient.prefetchQuery(rsmodelApi.getRSModelQueryOptions({ itemID }));
}
