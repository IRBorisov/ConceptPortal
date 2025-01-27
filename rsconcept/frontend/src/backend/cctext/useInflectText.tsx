import { useMutation } from '@tanstack/react-query';

import { IWordFormPlain } from '@/models/language';

import { DataCallback } from '../apiTransport';
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
