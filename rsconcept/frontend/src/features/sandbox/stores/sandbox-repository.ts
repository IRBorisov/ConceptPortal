import fileDownload from 'js-file-download';

import { createStarterSandboxBundle } from '../backend/create-starter-bundle';
import { assertModelSchemaInvariant, type SandboxBundle, schemaSandboxBundle } from '../models/bundle';

import { sandboxDB } from './sandbox-db';

const ROW_ID = 'current' as const;

export async function loadBundle(): Promise<SandboxBundle | null> {
  const row = await sandboxDB.bundle.get(ROW_ID);
  return row?.bundle ?? null;
}

export async function saveBundle(bundle: SandboxBundle): Promise<void> {
  assertModelSchemaInvariant(bundle);
  const parsed = schemaSandboxBundle.parse(bundle);
  await sandboxDB.bundle.put({ id: ROW_ID, bundle: parsed });
}

/** Ensure Dexie has a document; seed from code when empty. */
export async function ensureBundleLoaded(): Promise<SandboxBundle> {
  const existing = await loadBundle();
  if (existing) {
    return schemaSandboxBundle.parse(existing);
  }
  const starter = createStarterSandboxBundle();
  await saveBundle(starter);
  return starter;
}

export function parseBundleJson(raw: unknown): SandboxBundle {
  const parsed = schemaSandboxBundle.safeParse(raw);
  if (!parsed.success) {
    throw new Error('Неверный файл песочницы');
  }
  assertModelSchemaInvariant(parsed.data);
  return parsed.data;
}

export async function importBundleFromJson(raw: unknown): Promise<SandboxBundle> {
  const bundle = parseBundleJson(raw);
  await saveBundle(bundle);
  return bundle;
}

export function downloadBundle(bundle: SandboxBundle, filename = 'sandbox-bundle.json'): void {
  const parsed = schemaSandboxBundle.parse(bundle);
  const text = JSON.stringify(parsed, null, 2);
  fileDownload(text, filename);
}
