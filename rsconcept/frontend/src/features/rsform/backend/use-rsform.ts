import { useSuspenseQuery } from '@tanstack/react-query';

import { queryClient } from '@/backend/query-client';

import { rsformsApi } from './api';

export function useRSForm({ itemID, version }: { itemID?: number; version?: number }) {
  const { data } = useSuspenseQuery({
    ...rsformsApi.getRSFormQueryOptions({ itemID, version })
  });
  return {
    schema: data.transformed,
    raw: data.raw
  };
}

export function prefetchRSForm({ itemID, version }: { itemID?: number; version?: number }) {
  if (!itemID) {
    return null;
  }
  return queryClient.prefetchQuery(rsformsApi.getRSFormQueryOptions({ itemID, version }));
}
