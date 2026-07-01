import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { TUPLE_ID } from '@rsconcept/domain';

import { EvalStatus, RSToolWrapperClient } from '../../src';

import {
  A1_ID,
  A3_ID,
  A4_ID,
  D5_ID,
  D6_ID,
  D10_ID,
  DEFAULT_RSFORM_SESSION_PATH,
  DEFAULT_RSMODEL_SESSION_PATH,
  S1_ID,
  S2_ID,
  S3_ID,
  S4_ID,
  X1_ID,
  X2_ID,
  X3_ID,
  X4_ID
} from './constants';

/**
 * Демо-эпизод: Алиса в ситуации «переговоры» выделяет «стол»,
 * рассматривает «выйти» и «остаться», выбирает «выйти».
 */
const X1_BINDING = { 0: 'переговоры' } as const;
const X2_BINDING = { 0: 'стол', 1: 'дверь' } as const;
const X3_BINDING = { 0: 'Алиса' } as const;
const X4_BINDING = { 0: 'выйти', 1: 'остаться' } as const;

/** S1: состав ситуации — стол и дверь в переговорах. */
const S1_VALUE = [
  [TUPLE_ID, 0, 0],
  [TUPLE_ID, 0, 1]
] as const;

/** S2: Алиса выделяет стол в переговорах. */
const S2_VALUE = [[TUPLE_ID, 0, 0, 0]] as const;

/** S3: Алиса рассматривает оба действия. */
const S3_VALUE = [
  [TUPLE_ID, 0, 0, 0],
  [TUPLE_ID, 0, 0, 1]
] as const;

/** S4: Алиса выбирает «выйти». */
const S4_VALUE = [[TUPLE_ID, 0, 0, 0]] as const;

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
      set: [
        { target: X1_ID, value: X1_BINDING },
        { target: X2_ID, value: X2_BINDING },
        { target: X3_ID, value: X3_BINDING },
        { target: X4_ID, value: X4_BINDING },
        { target: S1_ID, value: S1_VALUE },
        { target: S2_ID, value: S2_VALUE },
        { target: S3_ID, value: S3_VALUE },
        { target: S4_ID, value: S4_VALUE }
      ]
    });

    const recalculated = await client.call<{
      items: { id: number; alias: string; value: unknown; status: number }[];
    }>('recalculateModel', {
      sessionId: imported.sessionId
    });

    const d5 = recalculated.items.find(item => item.id === D5_ID);
    const d6 = recalculated.items.find(item => item.id === D6_ID);
    const d10 = recalculated.items.find(item => item.id === D10_ID);
    const a1Eval = await client.call<{ success: boolean; value: unknown; status: number }>('evaluate', {
      sessionId: imported.sessionId,
      constituentId: A1_ID
    });
    const a3Eval = await client.call<{ success: boolean; value: unknown; status: number }>('evaluate', {
      sessionId: imported.sessionId,
      constituentId: A3_ID
    });
    const a4Eval = await client.call<{ success: boolean; value: unknown; status: number }>('evaluate', {
      sessionId: imported.sessionId,
      constituentId: A4_ID
    });

    console.log('D5 Pr3(S2):', d5);
    console.log('D6 Pr1,2(S2):', d6);
    console.log('D10 Pr1,2(S3):', d10);
    console.log('A1:', a1Eval);
    console.log('A3:', a3Eval);
    console.log('A4:', a4Eval);

    if (!Array.isArray(d5?.value) || !d5.value.includes(0)) {
      throw new Error(`Expected D5 to include element 0 (стол); got ${JSON.stringify(d5)}`);
    }

    if (
      !Array.isArray(d6?.value) ||
      d6.value.length !== 1 ||
      !Array.isArray(d6.value[0]) ||
      d6.value[0][0] !== TUPLE_ID ||
      d6.value[0][1] !== 0 ||
      d6.value[0][2] !== 0
    ) {
      throw new Error(`Expected D6 = {(0,0)}; got ${JSON.stringify(d6)}`);
    }

    if (!a1Eval.success || a1Eval.status === EvalStatus.AXIOM_FALSE || a1Eval.value !== 1) {
      throw new Error(`Expected A1 to hold; got ${JSON.stringify(a1Eval)}`);
    }

    if (!a3Eval.success || a3Eval.status === EvalStatus.AXIOM_FALSE || a3Eval.value !== 1) {
      throw new Error(`Expected A3 to hold; got ${JSON.stringify(a3Eval)}`);
    }

    if (!a4Eval.success || a4Eval.status === EvalStatus.AXIOM_FALSE || a4Eval.value !== 1) {
      throw new Error(`Expected A4 to hold; got ${JSON.stringify(a4Eval)}`);
    }

    await client.call('commitStep', {
      sessionId: imported.sessionId,
      message: 'Модель МОВД: Алиса, переговоры, стол значим, выбор «выйти»'
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
