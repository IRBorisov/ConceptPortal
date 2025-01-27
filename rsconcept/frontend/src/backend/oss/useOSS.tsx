import { useQuery, useSuspenseQuery } from '@tanstack/react-query';

import { useLibrary, useLibrarySuspense } from '@/backend/library/useLibrary';
import { LibraryItemID } from '@/models/library';
import { OssLoader } from '@/models/OssLoader';

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
