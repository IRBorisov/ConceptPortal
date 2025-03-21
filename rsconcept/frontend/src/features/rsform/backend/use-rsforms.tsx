import { useSuspenseQueries } from '@tanstack/react-query';

import { DELAYS } from '../../../backend/configuration';

import { rsformsApi } from './api';
import { RSFormLoader } from './rsform-loader';

export function useRSForms(itemIDs: number[]) {
  const results = useSuspenseQueries({
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
