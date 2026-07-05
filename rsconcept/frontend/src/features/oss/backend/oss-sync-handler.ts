import { type QueryClient } from '@tanstack/react-query';

import { KEYS } from '@/backend/configuration';
import { prepareCrossTabDataReset } from '@/backend/cross-tab-reset-notify';
import { invalidateRelatedSchemas, isRemoteAtLeastAsRecent, patchLibraryTimestamp } from '@/backend/item-sync-utils';

import { applyOss } from './api';
import { isOssSyncDto, type OssSyncEvent } from './oss-sync';
import { type OperationSchemaDTO } from './types';

function invalidateOssItem(client: QueryClient, itemID: number): void {
  const cachedOss = client.getQueryData<OperationSchemaDTO>(KEYS.composite.oss({ itemID }));
  if (cachedOss) {
    invalidateRelatedSchemas(
      client,
      cachedOss.operations.map(operation => operation.result)
    );
  }
  void Promise.allSettled([
    client.invalidateQueries({
      queryKey: KEYS.composite.oss({ itemID }),
      exact: true
    }),
    client.invalidateQueries({ queryKey: KEYS.composite.libraryList })
  ]);
}

/** Apply a cross-tab OSS sync event to the local query cache. */
export function handleOssSyncEvent(event: OssSyncEvent, client: QueryClient): void {
  const notifyReset = prepareCrossTabDataReset(event.itemID);

  if (isOssSyncDto(event)) {
    const cached = client.getQueryData<{ time_update: string }>(KEYS.composite.oss({ itemID: event.itemID }));
    if (isRemoteAtLeastAsRecent(event.data.time_update, cached?.time_update)) {
      notifyReset();
      applyOss(event.data, client);
      patchLibraryTimestamp(client, event.itemID, event.data.time_update);
      invalidateRelatedSchemas(
        client,
        event.data.operations.map(operation => operation.result)
      );
      return;
    }
  }

  notifyReset();
  invalidateOssItem(client, event.itemID);
}
