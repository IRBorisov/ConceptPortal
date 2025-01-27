import { useMutation } from '@tanstack/react-query';

import { LibraryItemID, VersionID } from '@/models/library';

import { rsformsApi } from './api';

export const useDownloadRSForm = () => {
  const mutation = useMutation({
    mutationKey: [rsformsApi.baseKey, 'download'],
    mutationFn: rsformsApi.download
  });
  return {
    download: (
      data: {
        itemID: LibraryItemID; //
        version?: VersionID;
      },
      onSuccess?: (data: Blob) => void
    ) => mutation.mutate(data, { onSuccess })
  };
};
