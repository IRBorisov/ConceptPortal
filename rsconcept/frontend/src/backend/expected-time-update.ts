import { KEYS } from '@/backend/configuration';
import { queryClient } from '@/backend/query-client';

/** Resolve cached ``time_update`` for optimistic concurrency headers. */
export function resolveExpectedTimeUpdate(itemID: number): string | undefined {
  const schema = queryClient.getQueryData<{
    raw?: { time_update?: string };
    transformed?: { time_update?: string };
  }>(KEYS.composite.schema({ itemID }));
  if (schema?.raw?.time_update) {
    return schema.raw.time_update;
  }
  if (schema?.transformed?.time_update) {
    return schema.transformed.time_update;
  }

  const oss = queryClient.getQueryData<{ time_update?: string }>(KEYS.composite.oss({ itemID }));
  if (oss?.time_update) {
    return oss.time_update;
  }

  const model = queryClient.getQueryData<{ time_update?: string }>(KEYS.composite.model({ itemID }));
  if (model?.time_update) {
    return model.time_update;
  }

  return undefined;
}
