import { useMutation, useQueryClient } from '@tanstack/react-query';

import { DataCallback } from '@/backend/apiTransport';
import { libraryApi } from '@/backend/library/api';
import { ILibraryItem } from '@/models/library';
import { IRSFormData } from '@/models/rsform';

import { IRSFormUploadDTO, rsformsApi } from './api';

export const useUploadTRS = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [rsformsApi.baseKey, 'load-trs'],
    mutationFn: rsformsApi.upload,
    onSuccess: data => {
      client.setQueryData([rsformsApi.getRSFormQueryOptions({ itemID: data.id }).queryKey], data);
      client.setQueryData([libraryApi.libraryListKey], (prev: ILibraryItem[] | undefined) =>
        prev?.map(item => (item.id === data.id ? data : item))
      );
    }
  });
  return {
    upload: (
      data: IRSFormUploadDTO, //
      onSuccess?: DataCallback<IRSFormData>
    ) => mutation.mutate(data, { onSuccess })
  };
};
