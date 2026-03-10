import { z } from 'zod';

import { schemaLibraryItem } from '@/features/library/backend/types';

/** Represents data for {@link RSModel} provided by backend. */
export type RSModelDTO = z.infer<typeof schemaRSModel>;

/** Represents data for {@link Constituenta} provided by backend. */
export type ConstituentaValue = z.infer<typeof schemaConstituentaValue>;

/** Represents data for {@link Constituenta} provided to backend. */
export type ConstituentaDataDTO = z.infer<typeof schemaUpdateValues>;

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
    z.number(),
    RecursiveArraySchema
  ])
});


export const schemaConstituentaData = z.strictObject({
  target: z.number(),
  type: z.string(),
  data: z.union([
    z.record(z.number(), z.string()),
    z.number(),
    RecursiveArraySchema
  ])
});

export const schemaUpdateValues = z.array(schemaConstituentaData);

export const schemaRSModel = schemaLibraryItem.extend({
  editors: z.array(z.number()),
  schema: z.number(),
  items: z.array(schemaConstituentaValue)
});
