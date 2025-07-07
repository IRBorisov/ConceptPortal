import { useQuery, useSuspenseQuery } from '@tanstack/react-query';

import { queryClient } from '@/backend/query-client';

import { ossApi } from './api';
import { OssLoader } from './oss-loader';

export function useOss({ itemID }: { itemID?: number }) {
  const { data, isLoading, error } = useQuery({
    ...ossApi.getOssQueryOptions({ itemID })
  });

  const schema = data ? new OssLoader(data).produceOSS() : undefined;
  return { schema: schema, isLoading: isLoading, error: error };
}

export function useOssSuspense({ itemID }: { itemID: number }) {
  const { data } = useSuspenseQuery({
    ...ossApi.getOssQueryOptions({ itemID })
  });
  const schema = new OssLoader(data!).produceOSS();
  return { schema };
}

export function prefetchOSS({ itemID }: { itemID?: number }) {
  if (!itemID) {
    return null;
  }
  return queryClient.prefetchQuery(ossApi.getOssQueryOptions({ itemID }));
}
