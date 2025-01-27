import { useMutation, useQueryClient } from '@tanstack/react-query';

import { DataCallback } from '@/backend/apiTransport';
import { useUpdateTimestamp } from '@/backend/library/useUpdateTimestamp';
import { LibraryItemID } from '@/models/library';
import { ConstituentaID, ITargetCst } from '@/models/rsform';

import { rsformsApi } from './api';

export const useProduceStructure = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [rsformsApi.baseKey, 'produce-structure'],
    mutationFn: rsformsApi.produceStructure,
    onSuccess: data => {
      client.setQueryData([rsformsApi.getRSFormQueryOptions({ itemID: data.schema.id }).queryKey], data.schema);
      updateTimestamp(data.schema.id);
      // TODO: invalidate OSS?
    }
  });
  return {
    produceStructure: (
      data: {
        itemID: LibraryItemID; //
        data: ITargetCst;
      },
      onSuccess?: DataCallback<ConstituentaID[]>
    ) => mutation.mutate(data, { onSuccess: response => onSuccess?.(response.cst_list) })
  };
};
