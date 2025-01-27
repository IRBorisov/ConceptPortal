import { useMutation } from '@tanstack/react-query';

import { DataCallback } from '../apiTransport';
import { cctextApi, ITextResult } from './api';

export const useParseText = () => {
  const mutation = useMutation({
    mutationKey: [cctextApi.baseKey, 'parse-text'],
    mutationFn: cctextApi.parseText
  });
  return {
    parseText: (
      data: { text: string }, //
      onSuccess?: DataCallback<ITextResult>
    ) => mutation.mutate(data, { onSuccess })
  };
};
