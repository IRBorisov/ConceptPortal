import { z } from 'zod';

import { RequireAuth } from '@/features/auth/components/require-auth';

import { useQueryStrings } from '@/hooks/use-query-strings';

import { FormCreateItem } from './form-create-item';

const paramsSchema = z.strictObject({
  modelFrom: z.coerce
    .number()
    .nullish()
    .transform(v => v ?? undefined)
});

export function CreateItemPage() {
  const query = useQueryStrings();

  const urlData = paramsSchema.parse({
    modelFrom: query.get('modelFrom')
  });

  return (
    <RequireAuth>
      <FormCreateItem modelFrom={urlData.modelFrom} />
    </RequireAuth>
  );
}
