import { z } from 'zod';

import { LibraryItemType } from '@rsconcept/domain/library';

import { RequireAuth } from '@/features/auth/components/require-auth';

import { useQueryStrings } from '@/hooks/use-query-strings';
import { optionalQueryInteger } from '@/utils/query-integer';

import { FormCreateItem } from './form-create-item';

const paramsSchema = z.strictObject({
  modelFrom: optionalQueryInteger(),
  itemType: z
    .enum([LibraryItemType.RSFORM, LibraryItemType.RSMODEL, LibraryItemType.OSS])
    .nullish()
    .transform(v => v ?? undefined)
});

export function CreateItemPage() {
  const query = useQueryStrings();

  const urlData = paramsSchema.parse({
    modelFrom: query.get('modelFrom'),
    itemType: query.get('itemType')
  });

  return (
    <RequireAuth>
      <FormCreateItem modelFrom={urlData.modelFrom} initialType={urlData.itemType} />
    </RequireAuth>
  );
}
