import { z } from 'zod';

import { schemaRelativizationInput } from '@/features/relativization';

export const schemaCreateStandaloneRelativization = schemaRelativizationInput.extend({
  item_data: z.strictObject({ title: z.string(), alias: z.string(), description: z.string().optional() })
});

export type CreateStandaloneRelativizationDTO = z.infer<typeof schemaCreateStandaloneRelativization>;
