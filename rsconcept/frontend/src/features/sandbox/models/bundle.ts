import { z } from 'zod';

import { schemaRSForm } from '@/features/rsform/backend/types';
import { schemaRSModel } from '@/features/rsmodel/backend/types';

export const STARTER_SCHEMA_ID = 1;
export const STARTER_MODEL_ID = 2;
export const STARTER_CST_ID = 1;

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

/** Read/write hook for the active sandbox bundle (React state + Dexie persist). */
export interface SandboxMutationSinkOptions {
  getBundle: () => SandboxBundle;
  setBundle: (next: SandboxBundle) => void;
  persist: (next: SandboxBundle) => void | Promise<void>;
}
