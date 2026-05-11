import { z } from 'zod';

import { schemaRSForm } from '@/features/rsform';
import { schemaRSModel } from '@/features/rsmodel';

export const SANDBOX_BUNDLE_FORMAT_VERSION = 2 as const;

export const schemaSandboxBundle = z.strictObject({
  formatVersion: z.literal(SANDBOX_BUNDLE_FORMAT_VERSION),
  meta: z.strictObject({
    nextId: z.number().int().positive(),
    updatedAt: z.string()
  }),
  schema: schemaRSForm,
  model: schemaRSModel
});

export type SandboxBundle = z.infer<typeof schemaSandboxBundle>;
