import { useQuery, useSuspenseQuery } from '@tanstack/react-query';

import { useLibrary, useLibrarySuspense } from '@/features/library/backend/useLibrary';
import { LibraryItemID } from '@/features/library/models/library';
import { OssLoader } from '@/features/oss/backend/OssLoader';

import { queryClient } from '../../../backend/queryClient';
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
