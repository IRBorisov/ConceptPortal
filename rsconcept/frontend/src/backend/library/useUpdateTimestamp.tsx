import { useQueryClient } from '@tanstack/react-query';

import { ILibraryItem, LibraryItemID } from '@/models/library';

import { libraryApi } from './api';

export function useUpdateTimestamp() {
  const client = useQueryClient();
  return {
    updateTimestamp: (target: LibraryItemID) =>
      client.setQueryData(
        libraryApi.libraryListKey, //
        (prev: ILibraryItem[] | undefined) =>
          prev?.map(item => (item.id === target ? { ...item, time_update: Date() } : item))
      )
  };
}
