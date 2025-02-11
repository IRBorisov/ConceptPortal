import { useMutation } from '@tanstack/react-query';

import { LibraryItemID } from '@/features/library/models/library';

import { ICheckConstituentaDTO, rsformsApi } from './api';

export const useCheckConstituenta = () => {
  const mutation = useMutation({
    mutationKey: ['actions', 'check-constituenta'],
    mutationFn: rsformsApi.checkConstituenta
  });
  return {
    checkConstituenta: (data: { itemID: LibraryItemID; data: ICheckConstituentaDTO }) => mutation.mutateAsync(data),
    isPending: mutation.isPending,
    error: mutation.error
  };
};
