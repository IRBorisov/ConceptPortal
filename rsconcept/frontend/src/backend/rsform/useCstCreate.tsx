import { useMutation, useQueryClient } from '@tanstack/react-query';

import { DataCallback } from '@/backend/apiTransport';
import { useUpdateTimestamp } from '@/backend/library/useUpdateTimestamp';
import { LibraryItemID } from '@/models/library';
import { IConstituentaMeta } from '@/models/rsform';

import { ICstCreateDTO, rsformsApi } from './api';

export const useCstCreate = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [rsformsApi.baseKey, 'create-cst'],
    mutationFn: rsformsApi.cstCreate,
    onSuccess: data => {
      client.setQueryData(rsformsApi.getRSFormQueryOptions({ itemID: data.schema.id }).queryKey, data.schema);
      updateTimestamp(data.schema.id);
      // TODO: invalidate OSS?
    }
  });
  return {
    cstCreate: (
      data: {
        itemID: LibraryItemID; //
        data: ICstCreateDTO;
      },
      onSuccess?: DataCallback<IConstituentaMeta>
    ) => mutation.mutate(data, { onSuccess: response => onSuccess?.(response.new_cst) })
  };
};
