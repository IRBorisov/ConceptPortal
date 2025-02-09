import { useQueries } from '@tanstack/react-query';

import { LibraryItemID } from '@/features/library/models/library';

import { DELAYS } from '../../../backend/configuration';
import { rsformsApi } from './api';
import { RSFormLoader } from './RSFormLoader';

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
