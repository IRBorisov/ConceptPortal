import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { RSToolWrapperClient } from '../../src';

import { BANK_DRAFTS } from './bank-constituents';
import { DEFAULT_RSFORM_SESSION_PATH } from './constants';

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

    for (const input of BANK_DRAFTS) {
      const result = await client.call<{
        state: { alias: string; analysis: { success: boolean } };
        diagnostics: unknown[];
      }>('addOrUpdateConstituenta', {
        sessionId: session.sessionId,
        input
      });
      const ok = result.state.analysis.success;
      const diagCount = result.diagnostics?.length ?? 0;
      console.log(`${input.draft.alias}: ${ok ? 'OK' : 'FAIL'} (${diagCount} diagnostics)`);
      if (!ok) {
        const diags = await client.call('listDiagnostics', { sessionId: session.sessionId });
        console.log(JSON.stringify(diags, null, 2));
        throw new Error(`${input.draft.alias}: analysis failed (${diagCount} diagnostics)`);
      }
    }

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
