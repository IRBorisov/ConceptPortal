import { useMutation } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';

import { rsformsApi } from './api';
import { ICheckConstituentaDTO } from './types';

export const useCheckConstituenta = () => {
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, 'actions', 'check-constituenta'],
    mutationFn: rsformsApi.checkConstituenta
  });
  return {
    checkConstituenta: (data: { itemID: number; data: ICheckConstituentaDTO }) => mutation.mutateAsync(data),
    isPending: mutation.isPending,
    error: mutation.error
  };
};
