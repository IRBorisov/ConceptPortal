import { useMutation } from '@tanstack/react-query';

import { ILexemeData } from '@/models/language';

import { DataCallback } from '../apiTransport';
import { cctextApi } from './api';

export const useGenerateLexeme = () => {
  const mutation = useMutation({
    mutationKey: [cctextApi.baseKey, 'generate-lexeme'],
    mutationFn: cctextApi.generateLexeme
  });
  return {
    generateLexeme: (
      data: { text: string }, //
      onSuccess?: DataCallback<ILexemeData>
    ) => mutation.mutate(data, { onSuccess })
  };
};
