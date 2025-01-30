import { useQuery, useSuspenseQuery } from '@tanstack/react-query';

import { useLibrary, useLibrarySuspense } from '@/backend/library/useLibrary';
import { OssLoader } from '@/backend/oss/OssLoader';
import { LibraryItemID } from '@/models/library';

import { queryClient } from '../queryClient';
import { ossApi } from './api';

export function useOss({ itemID }: { itemID?: LibraryItemID }) {
  const { items: libraryItems, isLoading: libraryLoading } = useLibrary();
  const { data, isLoading, error } = useQuery({
    ...ossApi.getOssQueryOptions({ itemID })
  });

  const schema = data && !libraryLoading ? new OssLoader(data, libraryItems).produceOSS() : undefined;
  return { schema: schema, isLoading: isLoading || libraryLoading, error: error };
}

export function useOssSuspense({ itemID }: { itemID: LibraryItemID }) {
  const { items: libraryItems } = useLibrarySuspense();
  const { data } = useSuspenseQuery({
    ...ossApi.getOssQueryOptions({ itemID })
  });
  const schema = new OssLoader(data!, libraryItems).produceOSS();
  return { schema };
}

export function prefetchOSS({ itemID }: { itemID?: LibraryItemID }) {
  if (!itemID) {
    return null;
  }
  return queryClient.prefetchQuery(ossApi.getOssQueryOptions({ itemID }));
}
