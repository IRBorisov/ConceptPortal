import { useMutation } from '@tanstack/react-query';

import { cctextApi } from './api';
import { IWordFormDTO } from './types';

export const useInflectText = () => {
  const mutation = useMutation({
    mutationKey: [cctextApi.baseKey, 'inflect-text'],
    mutationFn: cctextApi.inflectText
  });
  return {
    inflectText: (data: IWordFormDTO) => mutation.mutateAsync(data)
  };
};
