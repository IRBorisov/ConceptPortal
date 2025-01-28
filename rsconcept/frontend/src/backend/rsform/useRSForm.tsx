import { useQuery, useSuspenseQuery } from '@tanstack/react-query';

import { LibraryItemID, VersionID } from '@/models/library';
import { RSFormLoader } from '@/models/RSFormLoader';

import { rsformsApi } from './api';

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
