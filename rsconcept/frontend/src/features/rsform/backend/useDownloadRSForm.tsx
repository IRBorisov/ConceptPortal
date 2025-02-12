import { useMutation } from '@tanstack/react-query';

import { rsformsApi } from './api';

export const useDownloadRSForm = () => {
  const mutation = useMutation({
    mutationKey: [rsformsApi.baseKey, 'download'],
    mutationFn: rsformsApi.download
  });
  return {
    download: (data: { itemID: number; version?: number }) => mutation.mutateAsync(data)
  };
};
