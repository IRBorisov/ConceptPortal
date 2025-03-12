import { useMutation } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';

import { rsformsApi } from './api';

export const useDownloadRSForm = () => {
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, rsformsApi.baseKey, 'download'],
    mutationFn: rsformsApi.download
  });
  return {
    download: (data: { itemID: number; version?: number }) => mutation.mutateAsync(data)
  };
};
