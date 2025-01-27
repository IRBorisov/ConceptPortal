import { useMutation, useQueryClient } from '@tanstack/react-query';

import { DataCallback } from '@/backend/apiTransport';
import { useUpdateTimestamp } from '@/backend/library/useUpdateTimestamp';
import { rsformsApi } from '@/backend/rsform/api';
import { IVersionData, LibraryItemID } from '@/models/library';

import { libraryApi } from './api';

export const useVersionCreate = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [libraryApi.baseKey, 'create-version'],
    mutationFn: libraryApi.versionCreate,
    onSuccess: data => {
      client.setQueryData([rsformsApi.getRSFormQueryOptions({ itemID: data.schema.id }).queryKey], data.schema);
      updateTimestamp(data.schema.id);
    }
  });
  return {
    versionCreate: (
      data: {
        itemID: LibraryItemID; //
        data: IVersionData;
      },
      onSuccess?: DataCallback<IVersionData>
    ) => mutation.mutate(data, { onSuccess: () => onSuccess?.(data.data) })
  };
};
