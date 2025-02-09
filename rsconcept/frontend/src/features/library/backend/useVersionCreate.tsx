import { useMutation, useQueryClient } from '@tanstack/react-query';

import { DataCallback } from '@/backend/apiTransport';
import { rsformsApi } from '@/features/rsform/backend/api';

import { LibraryItemID, VersionID } from '../models/library';
import { IVersionCreateDTO, libraryApi } from './api';
import { useUpdateTimestamp } from './useUpdateTimestamp';

export const useVersionCreate = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [libraryApi.baseKey, 'create-version'],
    mutationFn: libraryApi.versionCreate,
    onSuccess: data => {
      client.setQueryData(rsformsApi.getRSFormQueryOptions({ itemID: data.schema.id }).queryKey, data.schema);
      updateTimestamp(data.schema.id);
    }
  });
  return {
    versionCreate: (
      data: {
        itemID: LibraryItemID; //
        data: IVersionCreateDTO;
      },
      onSuccess?: DataCallback<VersionID>
    ) => mutation.mutate(data, { onSuccess: response => onSuccess?.(response.version) })
  };
};
