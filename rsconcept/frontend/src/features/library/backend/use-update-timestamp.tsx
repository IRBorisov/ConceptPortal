import { useQueryClient } from '@tanstack/react-query';

import { type ILibraryItem } from './types';
import { useLibraryListKey } from './use-library';

export function useUpdateTimestamp() {
  const client = useQueryClient();
  const libraryKey = useLibraryListKey();
  return {
    updateTimestamp: (target: number) =>
      client.setQueryData(
        libraryKey, //
        (prev: ILibraryItem[] | undefined) =>
          prev?.map(item => (item.id === target ? { ...item, time_update: Date() } : item))
      )
  };
}
