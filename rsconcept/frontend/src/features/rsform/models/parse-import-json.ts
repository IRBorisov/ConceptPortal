import { globalTx } from '@/i18n';

import { schemaSandboxBundle } from '@/features/sandbox';

import { type RSFormImportJsonDTO, schemaRSFormImportJson } from '../backend/types';

import { rsFormContentToImportJson } from './json-file';

function isRecord(raw: unknown): raw is Record<string, unknown> {
  return typeof raw === 'object' && raw !== null;
}

function firstIssueMessage(error: { issues: { message?: string }[] }, fallback: string): string {
  return error.issues[0]?.message ?? fallback;
}

/** Parse Portal schema JSON export or sandbox bundle JSON into a load-json payload. */
export function parseRSFormImportJson(raw: unknown): RSFormImportJsonDTO {
  const portal = schemaRSFormImportJson.safeParse(raw);
  if (portal.success) {
    return portal.data;
  }

  const bundle = schemaSandboxBundle.safeParse(raw);
  if (bundle.success) {
    return rsFormContentToImportJson(bundle.data.schema);
  }

  if (isRecord(raw) && 'contract_version' in raw) {
    throw new Error(firstIssueMessage(portal.error, globalTx('tx.schema.upload.json.invalid')));
  }
  if (isRecord(raw) && 'formatVersion' in raw) {
    throw new Error(firstIssueMessage(bundle.error, globalTx('tx.sandbox.bundle.load.file.invalid')));
  }

  throw new Error(globalTx('tx.schema.upload.json.invalid'));
}

/** Read a JSON file with Portal schema export or sandbox bundle data. */
export async function readRSFormImportJsonFile(file: File): Promise<RSFormImportJsonDTO> {
  const payload = JSON.parse(await file.text()) as unknown;
  return parseRSFormImportJson(payload);
}
