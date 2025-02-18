import { useQueryClient } from '@tanstack/react-query';

import { libraryApi } from './api';
import { ILibraryItem } from './types';

export function useUpdateTimestamp() {
  const client = useQueryClient();
  return {
    updateTimestamp: (target: number) =>
      client.setQueryData(
        libraryApi.libraryListKey, //
        (prev: ILibraryItem[] | undefined) =>
          prev?.map(item => (item.id === target ? { ...item, time_update: Date() } : item))
      )
  };
}
