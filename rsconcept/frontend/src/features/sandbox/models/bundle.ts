import { z } from 'zod';

import { schemaRSForm } from '@/features/rsform';
import { validateImportedAliases } from '@/features/rsform/models/json-file';
import { schemaConstituentaValue, schemaRSModel } from '@/features/rsmodel';

export const SANDBOX_BUNDLE_FORMAT_VERSION = 2 as const;

export const schemaSandboxBundle = z
  .strictObject({
    formatVersion: z.literal(SANDBOX_BUNDLE_FORMAT_VERSION),
    meta: z.strictObject({
      nextId: z.number().int().positive(),
      updatedAt: z.string()
    }),
    schema: schemaRSForm,
    model: schemaRSModel.extend({ items: z.array(schemaConstituentaValue.strip()) })
  })
  .superRefine((data, ctx) => {
    const error = validateImportedAliases(data.schema.items);
    if (error) {
      ctx.addIssue({ code: 'custom', message: error });
    }
  });

export type SandboxBundle = z.infer<typeof schemaSandboxBundle>;
