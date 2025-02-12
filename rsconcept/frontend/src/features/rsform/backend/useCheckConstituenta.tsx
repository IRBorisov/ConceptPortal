import { useMutation } from '@tanstack/react-query';

import { ICheckConstituentaDTO, rsformsApi } from './api';

export const useCheckConstituenta = () => {
  const mutation = useMutation({
    mutationKey: ['actions', 'check-constituenta'],
    mutationFn: rsformsApi.checkConstituenta
  });
  return {
    checkConstituenta: (data: { itemID: number; data: ICheckConstituentaDTO }) => mutation.mutateAsync(data),
    isPending: mutation.isPending,
    error: mutation.error
  };
};
