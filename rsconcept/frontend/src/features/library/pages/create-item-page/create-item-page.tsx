import { z } from 'zod';

import { RequireAuth } from '@/features/auth/components/require-auth';
import { LibraryItemType } from '@/features/library/backend/types';

import { useQueryStrings } from '@/hooks/use-query-strings';

import { FormCreateItem } from './form-create-item';

const paramsSchema = z.strictObject({
  modelFrom: z.coerce
    .number()
    .nullish()
    .transform(v => v ?? undefined),
  fromSandbox: z
    .string()
    .nullish()
    .transform(v => v === '1' || v === 'true'),
  itemType: z
    .enum([LibraryItemType.RSFORM, LibraryItemType.RSMODEL])
    .nullish()
    .transform(v => v ?? undefined)
});

export function CreateItemPage() {
  const query = useQueryStrings();

  const urlData = paramsSchema.parse({
    modelFrom: query.get('modelFrom'),
    fromSandbox: query.get('fromSandbox'),
    itemType: query.get('itemType')
  });

  return (
    <RequireAuth>
      <FormCreateItem
        modelFrom={urlData.modelFrom}
        fromSandbox={urlData.fromSandbox}
        initialType={urlData.itemType}
      />
    </RequireAuth>
  );
}
