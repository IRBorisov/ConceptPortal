import { useMutation } from '@tanstack/react-query';

import { DataCallback } from '@/backend/apiTransport';
import { IConstituentaReference, ITargetCst } from '@/models/rsform';

import { ossApi } from './api';

export const useFindPredecessor = () => {
  const mutation = useMutation({
    mutationKey: [ossApi.baseKey, 'find-predecessor'],
    mutationFn: ossApi.getPredecessor
  });
  return {
    findPredecessor: (
      data: ITargetCst, //
      onSuccess?: DataCallback<IConstituentaReference>
    ) => mutation.mutate(data, { onSuccess })
  };
};
