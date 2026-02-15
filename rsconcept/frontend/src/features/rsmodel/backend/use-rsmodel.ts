import { useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';

import { rsformsApi } from '@/features/rsform/backend/api';

import { queryClient } from '@/backend/query-client';

import { rsmodelApi } from './api';

export function useRSModel({ itemID }: { itemID?: number; }) {
  const client = useQueryClient();
  const { data, isLoading, error } = useQuery({
    ...rsmodelApi.getRSModelQueryOptions({ itemID })
  });
  if (data) {
    client.setQueryData(rsformsApi.getRSFormQueryOptions({ itemID: data?.schema.id }).queryKey, data?.schema);
  }
  return { model: data, isLoading, error };
}

export function useRSModelSuspense({ itemID }: { itemID: number; }) {
  const client = useQueryClient();
  const { data } = useSuspenseQuery({
    ...rsmodelApi.getRSModelQueryOptions({ itemID })
  });
  client.setQueryData(rsformsApi.getRSFormQueryOptions({ itemID: data.schema.id }).queryKey, data.schema);
  return { model: data };
}

export function prefetchRSModel({ itemID }: { itemID?: number; }) {
  if (!itemID) {
    return null;
  }
  return queryClient.prefetchQuery(rsmodelApi.getRSModelQueryOptions({ itemID }));
}
