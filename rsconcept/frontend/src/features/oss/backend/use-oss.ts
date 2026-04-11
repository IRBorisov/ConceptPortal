import { useSuspenseQuery } from '@tanstack/react-query';

import { queryClient } from '@/backend/query-client';
import { type RO } from '@/utils/meta';

import { ossApi } from './api';
import { OssLoader } from './oss-loader';
import { type OperationSchemaDTO } from './types';

const selectOSS = (data: RO<OperationSchemaDTO>) => new OssLoader(data).produceOSS();

export function useOss({ itemID }: { itemID: number }) {
  const { data: schema } = useSuspenseQuery({
    ...ossApi.getOssQueryOptions({ itemID }),
    select: selectOSS
  });
  return { schema };
}

export function prefetchOSS({ itemID }: { itemID?: number }) {
  if (!itemID) {
    return null;
  }
  return queryClient.prefetchQuery(ossApi.getOssQueryOptions({ itemID }));
}
