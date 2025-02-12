import { useMutation, useQueryClient } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';
import { IRSFormDTO } from '@/features/rsform/backend/types';

import { libraryApi } from './api';

export const useVersionDelete = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [libraryApi.baseKey, 'delete-version'],
    mutationFn: libraryApi.versionDelete,
    onSuccess: (_, variables) => {
      client.setQueryData(KEYS.composite.rsItem({ itemID: variables.itemID }), (prev: IRSFormDTO | undefined) =>
        !prev
          ? undefined
          : {
              ...prev,
              versions: prev.versions.filter(version => version.id !== variables.versionID)
            }
      );
    }
  });
  return {
    versionDelete: (data: { itemID: number; versionID: number }) => mutation.mutateAsync(data)
  };
};
