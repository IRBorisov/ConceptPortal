import { useQueries } from '@tanstack/react-query';

import { RSFormLoader } from '@/backend/rsform/RSFormLoader';
import { LibraryItemID } from '@/models/library';

import { DELAYS } from '../configuration';
import { rsformsApi } from './api';

export function useRSForms(itemIDs: LibraryItemID[]) {
  const results = useQueries({
    queries: itemIDs.map(itemID => ({
      ...rsformsApi.getRSFormQueryOptions({ itemID }),
      enabled: itemIDs.length > 0,
      staleTime: DELAYS.staleShort
    }))
  });

  const schemas = results
    .map(result => result.data)
    .filter(data => data !== undefined)
    .map(data => new RSFormLoader(data).produceRSForm());
  return schemas;
}
