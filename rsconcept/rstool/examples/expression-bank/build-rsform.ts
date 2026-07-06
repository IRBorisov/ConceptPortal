import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { RSToolWrapperClient } from '../../src';

import { BANK_DRAFTS } from './bank-constituents';
import { DEFAULT_RSFORM_SESSION_PATH } from './constants';
import { assertCleanDiagnostics } from '../diagnostics-utils';

/**
 * Банк шаблонов выражений (Portal rsforms/42, alias БВ).
 * Радикалы R1–R3; секции T1–T10 с представителями F# и P#.
 */
async function run() {
  const client = new RSToolWrapperClient({
    cwd: resolve(process.cwd())
  });

  try {
    await client.waitUntilReady();
    const session = await client.call<{ sessionId: string; contractVersion: string }>('createSession');

    const patch = await client.call<{
      success: boolean;
      diagnostics: unknown[];
      failed: Array<{ draft: { alias: string }; diagnostics: unknown[] }>;
      summary: { items: Array<{ alias: string; analysisSuccess: boolean }> };
    }>('applySchemaPatch', {
      sessionId: session.sessionId,
      mode: 'atomic',
      items: BANK_DRAFTS.map(entry => entry.draft)
    });

    for (const item of patch.summary.items) {
      console.log(`${item.alias}: ${item.analysisSuccess ? 'OK' : 'FAIL'}`);
    }
    if (!patch.success) {
      const diags = await client.call('listDiagnostics', { sessionId: session.sessionId });
      console.log(JSON.stringify(diags, null, 2));
      const failedAlias = patch.failed[0]?.draft.alias ?? 'unknown';
      throw new Error(`${failedAlias}: analysis failed`);
    }

    await assertCleanDiagnostics(
      client,
      session.sessionId,
      new Map(BANK_DRAFTS.map(entry => [entry.draft.id!, entry.draft.alias])),
      'expression bank'
    );

    await client.call('commitStep', {
      sessionId: session.sessionId,
      message: 'Банк выражений (rsforms/42): шаблоны T1–T10 на радикалах R1–R3'
    });

    const exported = await client.call<string>('exportSession', {
      sessionId: session.sessionId
    });
    const outputPath = resolve(process.cwd(), DEFAULT_RSFORM_SESSION_PATH);
    await writeFile(outputPath, exported, 'utf8');
    console.log(`Exported: ${outputPath}`);
  } finally {
    await client.close();
  }
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
