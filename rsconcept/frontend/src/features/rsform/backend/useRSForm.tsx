import { useQuery, useSuspenseQuery } from '@tanstack/react-query';

import { LibraryItemID, VersionID } from '@/features/library/models/library';

import { queryClient } from '../../../backend/queryClient';
import { rsformsApi } from './api';
import { RSFormLoader } from './RSFormLoader';

export function useRSForm({ itemID, version }: { itemID?: LibraryItemID; version?: VersionID }) {
  const { data, isLoading, error } = useQuery({
    ...rsformsApi.getRSFormQueryOptions({ itemID, version })
  });

  const schema = data ? new RSFormLoader(data).produceRSForm() : undefined;
  return { schema, isLoading, error };
}

export function useRSFormSuspense({ itemID, version }: { itemID: LibraryItemID; version?: VersionID }) {
  const { data } = useSuspenseQuery({
    ...rsformsApi.getRSFormQueryOptions({ itemID, version })
  });
  const schema = new RSFormLoader(data!).produceRSForm();
  return { schema };
}

export function prefetchRSForm({ itemID, version }: { itemID?: LibraryItemID; version?: VersionID }) {
  if (!itemID) {
    return null;
  }
  return queryClient.prefetchQuery(rsformsApi.getRSFormQueryOptions({ itemID, version }));
}
