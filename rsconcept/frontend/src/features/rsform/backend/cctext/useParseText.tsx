import { useMutation } from '@tanstack/react-query';

import { cctextApi } from './api';

export const useParseText = () => {
  const mutation = useMutation({
    mutationKey: [cctextApi.baseKey, 'parse-text'],
    mutationFn: cctextApi.parseText
  });
  return {
    parseText: (data: { text: string }) => mutation.mutateAsync(data)
  };
};
