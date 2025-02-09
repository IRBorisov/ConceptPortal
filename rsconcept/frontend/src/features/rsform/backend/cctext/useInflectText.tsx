import { useMutation } from '@tanstack/react-query';

import { DataCallback } from '@/backend/apiTransport';

import { cctextApi, ITextResult, IWordFormDTO } from './api';

export const useInflectText = () => {
  const mutation = useMutation({
    mutationKey: [cctextApi.baseKey, 'inflect-text'],
    mutationFn: cctextApi.inflectText
  });
  return {
    inflectText: (
      data: IWordFormDTO, //
      onSuccess?: DataCallback<ITextResult>
    ) => mutation.mutate(data, { onSuccess })
  };
};
