import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { EvalStatus, RSToolWrapperClient } from '../../src';

import { A1_ID, D6_ID, DEFAULT_RSFORM_SESSION_PATH, DEFAULT_RSMODEL_SESSION_PATH, T1_ID } from './constants';
import { CHOCOLATE_MODEL_SET } from './model-demo';
import { assertCleanDiagnostics } from '../diagnostics-utils';

async function run() {
  const client = new RSToolWrapperClient({
    cwd: resolve(process.cwd())
  });

  try {
    await client.waitUntilReady();
    const schemaPath = resolve(process.cwd(), DEFAULT_RSFORM_SESSION_PATH);
    const schemaJson = await readFile(schemaPath, 'utf8');

    const imported = await client.call<{ sessionId: string }>('importData', {
      payload: schemaJson
    });

    await client.call('setModelValues', {
      sessionId: imported.sessionId,
      set: [...CHOCOLATE_MODEL_SET]
    });

    const recalculated = await client.call<{
      items: { id: number; alias: string; value: unknown; status: number }[];
    }>('recalculateModel', {
      sessionId: imported.sessionId
    });

    const d6 = recalculated.items.find(item => item.id === D6_ID);
    const a1Eval = await client.call<{ success: boolean; value: unknown; status: number }>('evaluate', {
      sessionId: imported.sessionId,
      constituentId: A1_ID
    });
    const t1Eval = await client.call<{ success: boolean; value: unknown; status: number }>('evaluate', {
      sessionId: imported.sessionId,
      constituentId: T1_ID
    });

    console.log('D6 recalculate:', d6);
    console.log('A1 evaluate:', a1Eval);
    console.log('T1 evaluate:', t1Eval);

    if (!a1Eval.success || a1Eval.status === EvalStatus.AXIOM_FALSE || a1Eval.value !== 1) {
      throw new Error(`Expected A1 to hold; got ${JSON.stringify(a1Eval)}`);
    }

    if (!t1Eval.success || t1Eval.value !== 0) {
      throw new Error(`Expected T1 (game not over) to be false; got ${JSON.stringify(t1Eval)}`);
    }

    if (d6?.value !== 4) {
      throw new Error(`Expected D6=4 piles; got ${JSON.stringify(d6)}`);
    }

    const state = await client.call<{ items: Array<{ id: number; alias: string }> }>('getSessionState', {
      sessionId: imported.sessionId,
      detail: 'full'
    });
    await assertCleanDiagnostics(
      client,
      imported.sessionId,
      new Map(state.items.map(item => [item.id, item.alias])),
      'chocolate-nim RSModel'
    );

    await client.call('commitStep', {
      sessionId: imported.sessionId,
      message: 'Модель шоколадного Нима: 4×6, долька (2,3), четыре кучки, A1 выполняется'
    });

    const exported = await client.call<string>('exportSession', {
      sessionId: imported.sessionId
    });
    const outputPath = resolve(process.cwd(), DEFAULT_RSMODEL_SESSION_PATH);
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
