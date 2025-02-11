import { useMutation } from '@tanstack/react-query';

import { cctextApi } from './api';

export const useGenerateLexeme = () => {
  const mutation = useMutation({
    mutationKey: [cctextApi.baseKey, 'generate-lexeme'],
    mutationFn: cctextApi.generateLexeme
  });
  return {
    generateLexeme: (data: { text: string }) => mutation.mutateAsync(data)
  };
};
