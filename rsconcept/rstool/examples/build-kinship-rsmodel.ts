import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { EvalStatus, RSToolWrapperClient } from '../src';

import { A1_ID, D3_ID, S2_ID, S3_ID } from './kinship/constants';

/** Tuple marker in structured values. */
const TUPLE_ID = -111;

/**
 * Minimal family so D3 (внучатые племянники) is non-empty:
 * - 0,1 Иван/Мария — общие родители 2,3
 * - 2 Пётр, 3 Анна — сиблинги
 * - 4 Олег — сын Петра
 * - 5 Дарья — дочь Анны (племянница Петра)
 * - 6 Семён — сын Дарьи (внучатый племянник Петра)
 */
const X1_BINDING = {
  0: 'Иван',
  1: 'Мария',
  2: 'Пётр',
  3: 'Анна',
  4: 'Олег',
  5: 'Дарья',
  6: 'Семён'
} as const;

/** S1: (parent, child) pairs — numeric indices into X1. */
const S1_VALUE = [
  [TUPLE_ID, 0, 2],
  [TUPLE_ID, 1, 2],
  [TUPLE_ID, 0, 3],
  [TUPLE_ID, 1, 3],
  [TUPLE_ID, 2, 4],
  [TUPLE_ID, 3, 5],
  [TUPLE_ID, 5, 6]
] as const;

/** Indices of men and women in the sample family (Иван, Пётр, Олег, Семён — м; остальные — ж). */
const S2_VALUE = [0, 2, 4, 6] as const;
const S3_VALUE = [1, 3, 5] as const;

async function run() {
  const client = new RSToolWrapperClient({
    cwd: resolve(process.cwd())
  });

  try {
    await client.waitUntilReady();
    const kinshipPath = resolve(process.cwd(), 'examples', 'kinship-rsform-session.json');
    const kinshipJson = await readFile(kinshipPath, 'utf8');

    const imported = await client.call<{ sessionId: string }>('importSession', {
      payload: kinshipJson
    });

    await client.call('setConstituentaValues', {
      sessionId: imported.sessionId,
      input: {
        items: [
          { target: 1, value: X1_BINDING },
          { target: 2, value: S1_VALUE },
          { target: S2_ID, value: S2_VALUE },
          { target: S3_ID, value: S3_VALUE }
        ]
      }
    });

    const recalculated = await client.call<{
      items: { id: number; alias: string; value: unknown; status: number }[];
    }>('recalculateModel', {
      sessionId: imported.sessionId
    });

    const d3 = recalculated.items.find(item => item.id === D3_ID);
    const d3Eval = await client.call<{ success: boolean; value: unknown; status: number }>('evaluateConstituenta', {
      sessionId: imported.sessionId,
      input: { constituentId: D3_ID }
    });

    const a1Eval = await client.call<{ success: boolean; value: unknown; status: number }>('evaluateConstituenta', {
      sessionId: imported.sessionId,
      input: { constituentId: A1_ID }
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

    await client.call('commitStep', {
      sessionId: imported.sessionId,
      message: 'Модель kinship: D3 непуст; A1 card(X1)≤10 выполняется'
    });

    const exported = await client.call<string>('exportSession', {
      sessionId: imported.sessionId
    });
    const outputPath = resolve(process.cwd(), 'examples', 'kinship-rsmodel-session.json');
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
