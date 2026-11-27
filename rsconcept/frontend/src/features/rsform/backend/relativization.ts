import { z } from 'zod';

import {
  schemaConfirmRelativizationReview,
  schemaRelativizationInput,
  schemaSkipRelativizationReview
} from '@/features/relativization';

const schemaStandaloneRelativizationResult = schemaRelativizationInput.extend({
  item_data: z.strictObject({ title: z.string(), alias: z.string(), description: z.string().optional() })
});

export const schemaCreateStandaloneRelativization = z.union([
  schemaStandaloneRelativizationResult.extend(schemaSkipRelativizationReview.shape),
  schemaStandaloneRelativizationResult.extend(schemaConfirmRelativizationReview.shape)
]);

export type CreateStandaloneRelativizationDTO = z.infer<typeof schemaCreateStandaloneRelativization>;
