import { useQueryClient } from '@tanstack/react-query';

import { ILibraryItem } from '../models/library';
import { libraryApi } from './api';

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
