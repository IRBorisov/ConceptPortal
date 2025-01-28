import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUpdateTimestamp } from '@/backend/library/useUpdateTimestamp';
import { LibraryItemID } from '@/models/library';
import { ICstSubstitutions } from '@/models/oss';

import { rsformsApi } from './api';

export const useCstSubstitute = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [rsformsApi.baseKey, 'substitute-cst'],
    mutationFn: rsformsApi.cstSubstitute,
    onSuccess: data => {
      client.setQueryData(rsformsApi.getRSFormQueryOptions({ itemID: data.id }).queryKey, data);
      updateTimestamp(data.id);
      // TODO: invalidate OSS?
    }
  });
  return {
    cstSubstitute: (
      data: {
        itemID: LibraryItemID; //
        data: ICstSubstitutions;
      },
      onSuccess?: () => void
    ) => mutation.mutate(data, { onSuccess })
  };
};
