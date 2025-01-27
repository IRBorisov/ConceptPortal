import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUpdateTimestamp } from '@/backend/library/useUpdateTimestamp';
import { rsformsApi } from '@/backend/rsform/api';
import { LibraryItemID, VersionID } from '@/models/library';

import { libraryApi } from './api';

export const useVersionRestore = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [libraryApi.baseKey, 'restore-version'],
    mutationFn: libraryApi.versionRestore,
    onSuccess: data => {
      client.setQueryData([rsformsApi.getRSFormQueryOptions({ itemID: data.id }).queryKey], data);
      updateTimestamp(data.id);
    }
  });
  return {
    versionRestore: (
      data: {
        itemID: LibraryItemID; //
        versionID: VersionID;
      },
      onSuccess?: () => void
    ) => mutation.mutate(data, { onSuccess })
  };
};
