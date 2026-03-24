import { useSuspenseQueries } from '@tanstack/react-query';

import { DELAYS } from '../../../backend/configuration';

import { rsformsApi } from './api';

export function useRSForms(itemIDs: number[]) {
  const results = useSuspenseQueries({
    queries: itemIDs.map(itemID => ({
      ...rsformsApi.getRSFormQueryOptions({ itemID }),
      enabled: itemIDs.length > 0,
      staleTime: DELAYS.staleShort
    }))
  });

  const schemas = results
    .map(result => result.data.transformed)
    .filter(data => data !== undefined);
  return schemas;
}
