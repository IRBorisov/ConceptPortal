import { useMutation, useQueryClient } from '@tanstack/react-query';

import { type RSForm } from '@rsconcept/domain/library';

import { type RSFormDTO } from '@/features/rsform';
import { notifySchemaSync } from '@/features/rsform/backend/schema-sync';

import { KEYS } from '@/backend/configuration';

import { libraryApi } from './api';

interface RSFormCache {
  raw: RSFormDTO;
  transformed: RSForm;
}

function removeSchemaVersion(prev: RSFormCache | undefined, versionID: number): RSFormCache | undefined {
  if (!prev) {
    return undefined;
  }
  const versions = prev.raw.versions.filter(version => version.id !== versionID);
  return {
    raw: { ...prev.raw, versions },
    transformed: { ...prev.transformed, versions }
  };
}

export function applyDeletedVersion(
  client: ReturnType<typeof useQueryClient>,
  itemID: number,
  versionID: number
) {
  client.setQueriesData({ queryKey: [KEYS.rsform, 'item', itemID] }, (prev: RSFormCache | undefined) =>
    removeSchemaVersion(prev, versionID)
  );
  client.removeQueries({ queryKey: KEYS.composite.schema({ itemID, version: versionID }) });
}

export const useDeleteVersion = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, libraryApi.baseKey, 'delete-version'],
    mutationFn: libraryApi.deleteVersion,
    onSuccess: (_, variables) => {
      applyDeletedVersion(client, variables.itemID, variables.versionID);
      notifySchemaSync(variables.itemID);
    },
    onError: () => client.invalidateQueries()
  });
  return { deleteVersion: mutation.mutateAsync };
};
