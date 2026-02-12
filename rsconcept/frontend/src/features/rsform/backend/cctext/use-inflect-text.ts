import { useMutation } from '@tanstack/react-query';

import { cctextApi } from './api';
import { type WordFormDTO } from './types';

export const useInflectText = () => {
  const mutation = useMutation({
    mutationKey: [cctextApi.baseKey, 'inflect-text'],
    mutationFn: cctextApi.inflectText
  });
  return {
    inflectText: (data: WordFormDTO) => mutation.mutateAsync(data)
  };
};
