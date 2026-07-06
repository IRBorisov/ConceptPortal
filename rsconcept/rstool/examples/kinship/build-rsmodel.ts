import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { EvalStatus, RSToolWrapperClient } from '../../src';

import { A1_ID, D3_ID, DEFAULT_RSFORM_SESSION_PATH, DEFAULT_RSMODEL_SESSION_PATH } from './constants';
import { KINSHIP_MODEL_SET } from './model-demo';
import { assertCleanDiagnostics } from '../diagnostics-utils';

async function run() {
  const client = new RSToolWrapperClient({
    cwd: resolve(process.cwd())
  });

  try {
    await client.waitUntilReady();
    const kinshipPath = resolve(process.cwd(), DEFAULT_RSFORM_SESSION_PATH);
    const kinshipJson = await readFile(kinshipPath, 'utf8');

    const imported = await client.call<{ sessionId: string }>('importData', {
      payload: kinshipJson
    });

    await client.call('setModelValues', {
      sessionId: imported.sessionId,
      set: [...KINSHIP_MODEL_SET]
    });

    const recalculated = await client.call<{
      items: { id: number; alias: string; value: unknown; status: number }[];
    }>('recalculateModel', {
      sessionId: imported.sessionId
    });

    const d3 = recalculated.items.find(item => item.id === D3_ID);
    const d3Eval = await client.call<{ success: boolean; value: unknown; status: number }>('evaluate', {
      sessionId: imported.sessionId,
      constituentId: D3_ID
    });

    const a1Eval = await client.call<{ success: boolean; value: unknown; status: number }>('evaluate', {
      sessionId: imported.sessionId,
      constituentId: A1_ID
    });

    console.log('D3 recalculate:', d3);
    console.log('D3 evaluate:', d3Eval);
    console.log('A1 evaluate:', a1Eval);

    if (
      !d3Eval.success ||
      d3Eval.status !== EvalStatus.HAS_DATA ||
      !Array.isArray(d3Eval.value) ||
      d3Eval.value.length === 0
    ) {
      console.error('Expected non-empty D3; got', d3Eval);
      throw new Error(`Expected non-empty D3; got ${JSON.stringify(d3Eval)}`);
    }

    if (!a1Eval.success || a1Eval.status === EvalStatus.AXIOM_FALSE || a1Eval.value !== 1) {
      console.error('Expected A1 card(X1)≤10 to hold; got', a1Eval);
      throw new Error(`Expected A1 card(X1)≤10 to hold; got ${JSON.stringify(a1Eval)}`);
    }

    const state = await client.call<{ items: Array<{ id: number; alias: string }> }>('getSessionState', {
      sessionId: imported.sessionId,
      detail: 'full'
    });
    await assertCleanDiagnostics(
      client,
      imported.sessionId,
      new Map(state.items.map(item => [item.id, item.alias])),
      'kinship RSModel'
    );

    await client.call('commitStep', {
      sessionId: imported.sessionId,
      message: 'Модель kinship: D3 непуст; A1 card(X1)≤10 выполняется'
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
