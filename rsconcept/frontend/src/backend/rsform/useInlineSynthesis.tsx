import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUpdateTimestamp } from '@/backend/library/useUpdateTimestamp';
import { LibraryItemID } from '@/models/library';
import { IRSFormData } from '@/models/rsform';

import { DataCallback } from '../apiTransport';
import { IInlineSynthesisDTO, rsformsApi } from './api';

export const useInlineSynthesis = () => {
  const client = useQueryClient();
  const { updateTimestamp } = useUpdateTimestamp();
  const mutation = useMutation({
    mutationKey: [rsformsApi.baseKey, 'inline-synthesis'],
    mutationFn: rsformsApi.inlineSynthesis,
    onSuccess: data => {
      client.setQueryData(rsformsApi.getRSFormQueryOptions({ itemID: data.id }).queryKey, data);
      updateTimestamp(data.id);
      // TODO: invalidate OSS?
    }
  });
  return {
    inlineSynthesis: (
      data: {
        itemID: LibraryItemID; //
        data: IInlineSynthesisDTO;
      },
      onSuccess?: DataCallback<IRSFormData>
    ) => mutation.mutate(data, { onSuccess })
  };
};
