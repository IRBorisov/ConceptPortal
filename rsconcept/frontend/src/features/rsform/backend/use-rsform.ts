import { useQuery, useSuspenseQuery } from '@tanstack/react-query';

import { queryClient } from '@/backend/query-client';

import { rsformsApi } from './api';
import { RSFormLoader } from './rsform-loader';

export function useRSForm({ itemID, version }: { itemID?: number; version?: number }) {
  const { data, isLoading, error } = useQuery({
    ...rsformsApi.getRSFormQueryOptions({ itemID, version })
  });

  const schema = data ? new RSFormLoader(data).produceRSForm() : undefined;
  return { schema, isLoading, error };
}

export function useRSFormSuspense({ itemID, version }: { itemID: number; version?: number }) {
  const { data } = useSuspenseQuery({
    ...rsformsApi.getRSFormQueryOptions({ itemID, version })
  });
  const schema = new RSFormLoader(data!).produceRSForm();
  return { schema };
}

export function prefetchRSForm({ itemID, version }: { itemID?: number; version?: number }) {
  if (!itemID) {
    return null;
  }
  return queryClient.prefetchQuery(rsformsApi.getRSFormQueryOptions({ itemID, version }));
}
