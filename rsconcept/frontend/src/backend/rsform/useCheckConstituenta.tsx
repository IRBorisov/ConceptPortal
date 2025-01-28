import { useMutation } from '@tanstack/react-query';

import { DataCallback } from '@/backend/apiTransport';
import { LibraryItemID } from '@/models/library';
import { IExpressionParse } from '@/models/rslang';

import { ICheckConstituentaDTO, rsformsApi } from './api';

export const useCheckConstituenta = () => {
  const mutation = useMutation({
    mutationKey: [rsformsApi.baseKey, 'check-constituenta'],
    mutationFn: rsformsApi.checkConstituenta
  });
  return {
    checkConstituenta: (
      data: {
        itemID: LibraryItemID; //
        data: ICheckConstituentaDTO;
      },
      onSuccess?: DataCallback<IExpressionParse>
    ) => mutation.mutate(data, { onSuccess }),
    isPending: mutation.isPending,
    error: mutation.error
  };
};
