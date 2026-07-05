import { useMutation, useQueryClient } from '@tanstack/react-query';

import { type RSForm } from '@rsconcept/domain/library';

import { type RSFormDTO } from '@/features/rsform';
import { notifySchemaSync } from '@/features/rsform/backend/schema-sync';

import { KEYS } from '@/backend/configuration';

import { libraryApi } from './api';
import { type VersionInfoDTO } from './types';

function patchSchemaVersions(
  prev: { raw: RSFormDTO; transformed: RSForm } | undefined,
  data: VersionInfoDTO
): { raw: RSFormDTO; transformed: RSForm } | undefined {
  if (!prev) {
    return undefined;
  }
  const versions = prev.raw.versions.map(version =>
    version.id === data.id ? { ...version, description: data.description, version: data.version } : version
  );
  return {
    raw: { ...prev.raw, versions },
    transformed: { ...prev.transformed, versions }
  };
}

export const useUpdateVersion = () => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationKey: [KEYS.global_mutation, libraryApi.baseKey, 'update-version'],
    mutationFn: libraryApi.updateVersion,
    onSuccess: (data, variables) => {
      client.setQueryData(
        KEYS.composite.schema({ itemID: variables.itemID }),
        (prev: { raw: RSFormDTO; transformed: RSForm } | undefined) => patchSchemaVersions(prev, data)
      );
      client.setQueryData(
        KEYS.composite.schema({ itemID: variables.itemID, version: variables.version.id }),
        (prev: { raw: RSFormDTO; transformed: RSForm } | undefined) => patchSchemaVersions(prev, data)
      );
      notifySchemaSync(variables.itemID);
    },
    onError: () => client.invalidateQueries()
  });
  return { updateVersion: mutation.mutateAsync };
};
