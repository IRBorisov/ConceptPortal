import { z } from 'zod';

export const schemaRelativizationInput = z.strictObject({
  source_time_update: z.string(),
  target: z.number(),
  excluded: z.array(z.number()),
  locale: z.enum(['en', 'ru', 'fr']),
  context_name: z.string().trim().min(1)
});
