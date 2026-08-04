import { toast } from 'react-toastify';
import fileDownload from 'js-file-download';

import { globalTx } from '@/i18n';
import { getInitialAppLocale } from '@/i18n/persisted-locale';

import { type SandboxBundle, schemaSandboxBundle } from '../models/bundle';
import { createStarterSandboxBundle } from '../models/bundle-starter';

import { sandboxDB } from './sandbox-db';

const ROW_ID = 'current' as const;
const DEFAULT_BUNDLE_FILE = 'sandbox-bundle.json' as const;

let cachedBundle: SandboxBundle | null = null;
let cachedBundlePromise: Promise<SandboxBundle> | null = null;

/** Drop in-memory bundle cache so the next load reads IndexedDB. */
export function invalidateBundleCache(): void {
  cachedBundle = null;
  cachedBundlePromise = null;
}

/** Keep in-memory cache aligned with the active sandbox session. */
export function syncBundleCache(bundle: SandboxBundle): void {
  cachedBundle = bundle;
  cachedBundlePromise = Promise.resolve(bundle);
}

export function getCachedBundle(): SandboxBundle | null {
  return cachedBundle;
}

export function getBundleLoadPromise(): Promise<SandboxBundle> {
  if (cachedBundlePromise === null) {
    cachedBundlePromise = ensureBundleLoaded().then(function rememberLoadedBundle(bundle) {
      cachedBundle = bundle;
      return bundle;
    });
  }

  return cachedBundlePromise;
}

/** Load the sandbox bundle from the database. */
export async function loadBundle(): Promise<SandboxBundle | null> {
  const row = await sandboxDB.bundle.get(ROW_ID);
  return row?.bundle ?? null;
}

/** Save the sandbox bundle to the database. */
export async function saveBundle(bundle: SandboxBundle): Promise<void> {
  const parsed = schemaSandboxBundle.parse(bundle);
  await sandboxDB.bundle.put({ id: ROW_ID, bundle: parsed });
  invalidateBundleCache();
}

/** Ensure Dexie has a document; seed from code when empty or stored data is invalid. */
export async function ensureBundleLoaded(): Promise<SandboxBundle> {
  const existing = await loadBundle();
  if (existing) {
    const parsed = schemaSandboxBundle.safeParse(existing);
    if (parsed.success) {
      return parsed.data;
    } else {
      toast.error(globalTx('tx.sandbox.bundle.load.fail.recover'));
    }
  }
  const starter = createStarterSandboxBundle(getInitialAppLocale());
  await saveBundle(starter);
  return starter;
}

/** Import a sandbox bundle from a JSON file. */
export async function importBundleFromJson(raw: unknown): Promise<SandboxBundle> {
  const bundle = parseBundleJson(raw);
  await saveBundle(bundle);
  return bundle;
}

/** Download the sandbox bundle to a JSON file. */
export function downloadBundle(bundle: SandboxBundle, filename: string = DEFAULT_BUNDLE_FILE): void {
  const parsed = schemaSandboxBundle.parse(bundle);
  const text = JSON.stringify(parsed, null, 2);
  fileDownload(text, filename);
}

// ===== Internals =====

function parseBundleJson(raw: unknown): SandboxBundle {
  const parsed = schemaSandboxBundle.safeParse(raw);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? globalTx('tx.sandbox.bundle.load.file.invalid');
    throw new Error(message);
  }
  return parsed.data;
}
