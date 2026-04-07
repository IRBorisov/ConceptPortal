import { z } from 'zod';

import { schemaRSForm } from '@/features/rsform/backend/types';
import { schemaRSModel } from '@/features/rsmodel/backend/types';

export const SANDBOX_BUNDLE_FORMAT_VERSION = 1 as const;

export const schemaSandboxBundle = z.strictObject({
  formatVersion: z.literal(SANDBOX_BUNDLE_FORMAT_VERSION),
  meta: z.strictObject({
    nextId: z.number().int().positive(),
    updatedAt: z.string()
  }),
  rsform: schemaRSForm,
  model: schemaRSModel
});

export type SandboxBundle = z.infer<typeof schemaSandboxBundle>;

export function assertModelSchemaInvariant(bundle: SandboxBundle): void {
  if (bundle.model.schema !== bundle.rsform.id) {
    throw new Error('Sandbox bundle invariant: model.schema must equal rsform.id');
  }
}

/** Read/write hook for the active sandbox bundle (React state + Dexie persist). */
export interface SandboxMutationSinkOptions {
  getBundle: () => SandboxBundle;
  setBundle: (next: SandboxBundle) => void;
  persist: (next: SandboxBundle) => void | Promise<void>;
}

