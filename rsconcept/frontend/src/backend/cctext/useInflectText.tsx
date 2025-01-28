import { useMutation } from '@tanstack/react-query';

import { DataCallback } from '@/backend/apiTransport';
import { IWordFormPlain } from '@/models/language';

import { cctextApi, ITextResult } from './api';

export const useInflectText = () => {
  const mutation = useMutation({
    mutationKey: [cctextApi.baseKey, 'inflect-text'],
    mutationFn: cctextApi.inflectText
  });
  return {
    inflectText: (
      data: IWordFormPlain, //
      onSuccess?: DataCallback<ITextResult>
    ) => mutation.mutate(data, { onSuccess })
  };
};
