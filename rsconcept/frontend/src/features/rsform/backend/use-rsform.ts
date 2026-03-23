import { useSuspenseQuery } from '@tanstack/react-query';

import { queryClient } from '@/backend/query-client';
import { type RO } from '@/utils/meta';

import { rsformsApi } from './api';
import { RSFormLoader } from './rsform-loader';
import { type RSFormDTO } from './types';

const selectRSForm = (data: RO<RSFormDTO>) => new RSFormLoader(data).produceRSForm();

export function useRSForm({ itemID, version }: { itemID?: number; version?: number; }) {
  const { data: schema } = useSuspenseQuery({
    ...rsformsApi.getRSFormQueryOptions({ itemID, version }),
    select: selectRSForm
  });
  return { schema };
}

export function prefetchRSForm({ itemID, version }: { itemID?: number; version?: number; }) {
  if (!itemID) {
    return null;
  }
  return queryClient.prefetchQuery(rsformsApi.getRSFormQueryOptions({ itemID, version }));
}
