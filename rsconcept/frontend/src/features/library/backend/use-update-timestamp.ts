import { useQueryClient } from '@tanstack/react-query';

import { type LibraryItem } from '@/domain/library';
import { type RO } from '@/utils/meta';

import { useLibraryListKey } from './use-library';

export function useUpdateTimestamp() {
  const client = useQueryClient();
  const libraryKey = useLibraryListKey();
  return {
    updateTimestamp: (target: number, timestamp: string) =>
      client.setQueryData(
        libraryKey, //
        (prev: RO<LibraryItem[]> | undefined) =>
          prev?.map(item => (item.id === target ? { ...item, time_update: timestamp } : item))
      )
  };
}
