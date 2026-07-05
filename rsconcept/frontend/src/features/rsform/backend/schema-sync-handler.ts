import { type QueryClient } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';
import { prepareCrossTabDataReset } from '@/backend/cross-tab-reset-notify';
import { invalidateRelatedOss, isRemoteAtLeastAsRecent, patchLibraryTimestamp } from '@/backend/item-sync-utils';

import { applyRSForm } from './api';
import { parseSchemaSyncDto, type SchemaSyncEvent } from './schema-sync';
import { type RSFormDTO } from './types';

function invalidateSchemaItem(client: QueryClient, itemID: number): void {
  const cachedSchema = client.getQueryData<{ raw: RSFormDTO }>(KEYS.composite.schema({ itemID }));
  if (cachedSchema) {
    invalidateRelatedOss(client, cachedSchema.raw.oss);
  }
  void Promise.allSettled([
    client.invalidateQueries({
      queryKey: KEYS.composite.schema({ itemID }),
      exact: true
    }),
    client.invalidateQueries({ queryKey: KEYS.composite.libraryList })
  ]);
}

/** Apply a cross-tab schema sync event to the local query cache. */
export function handleSchemaSyncEvent(event: SchemaSyncEvent, client: QueryClient): void {
  const notifyReset = prepareCrossTabDataReset(event.itemID);

  const dto = parseSchemaSyncDto(event);
  if (dto) {
    const cached = client.getQueryData<{ raw: { time_update: string } }>(
      KEYS.composite.schema({ itemID: event.itemID })
    );
    if (isRemoteAtLeastAsRecent(dto.time_update, cached?.raw.time_update)) {
      notifyReset();
      applyRSForm(dto, client);
      patchLibraryTimestamp(client, event.itemID, dto.time_update);
      invalidateRelatedOss(client, dto.oss);
      return;
    }
  }

  notifyReset();
  invalidateSchemaItem(client, event.itemID);
}
