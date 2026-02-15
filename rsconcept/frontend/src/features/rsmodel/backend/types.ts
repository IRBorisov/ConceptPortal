import { z } from 'zod';

import { schemaLibraryItem } from '@/features/library/backend/types';
import { schemaRSForm } from '@/features/rsform';

/** Represents data for {@link RSModel} provided by backend. */
export type RSModelDTO = z.infer<typeof schemaRSModel>;

/** Represents data for {@link Constituenta} provided by backend. */
export type ConstituentaValue = z.infer<typeof schemaConstituentaValue>;

/** Represents data for {@link Constituenta} provided to backend. */
export type ConstituentaDataDTO = z.infer<typeof schemaConstituentaData>;

// ========= SCHEMAS ========

type RecursiveArray = (number | RecursiveArray)[];
const RecursiveArraySchema: z.ZodType<RecursiveArray> = z.lazy(() =>
  z.array(
    z.union([
      z.number(),
      RecursiveArraySchema
    ])
  )
);

export const schemaConstituentaValue = z.strictObject({
  id: z.number(),
  type: z.string(),
  value: z.union([
    z.record(z.number(), z.string()),
    RecursiveArraySchema
  ])
});

export const schemaConstituentaData = z.strictObject({
  target: z.number(),
  type: z.string(),
  data: z.union([
    z.record(z.number(), z.string()),
    RecursiveArraySchema
  ])
});

export const schemaRSModel = schemaLibraryItem.extend({
  editors: z.array(z.number()),
  schema: schemaRSForm,
  items: z.array(schemaConstituentaValue)
});
