import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { TUPLE_ID } from '@rsconcept/domain';

import { CstType, EvalStatus, RSToolWrapperClient, type AgentConstituentaPatch } from '../../src';

type DraftBatch = { draft: AgentConstituentaPatch };

import {
  D1_ID,
  D2_ID,
  DEFAULT_RSFORM_SESSION_PATH,
  F_IMAGE_ID,
  F_SOURCES_ID,
  P_FUNCTION_ID,
  S1_ID,
  S2_ID,
  T1_ID,
  X1_ID,
  X2_ID
} from './constants';
import { assertCleanDiagnostics } from '../diagnostics-utils';

/** S1: назначение сотрудников на проекты. */
const S1_VALUE = [
  [TUPLE_ID, 0, 0],
  [TUPLE_ID, 0, 1],
  [TUPLE_ID, 1, 0]
] as const;

/** S2: подчинённость (цепочка 0→1→2). */
const S2_VALUE = [
  [TUPLE_ID, 0, 1],
  [TUPLE_ID, 1, 2]
] as const;

const X1_BINDING = { 0: 'Алиса', 1: 'Боб', 2: 'Кэрол' } as const;
const X2_BINDING = { 0: 'ПроектA', 1: 'ПроектB' } as const;

async function buildSchema(client: RSToolWrapperClient): Promise<string> {
  const session = await client.call<{ sessionId: string }>('createSession');

  const drafts: DraftBatch[] = [
    {
      draft: {
        id: T1_ID,
        alias: 'T1',
        cstType: CstType.STATEMENT,
        definitionFormal: '1=1',
        term: 'Применение шаблонов банка выражений',
        convention:
          'Подстановка радикалов БВ: R1→X1, R2→X2. Отношение σ→S1 или S2. Примеры: БВ F6→F_IMAGE, БВ F20→F_SOURCES, БВ P5→P_FUNCTION'
      }
    },
    {
      draft: {
        id: X1_ID,
        alias: 'X1',
        cstType: CstType.BASE,
        definitionFormal: '',
        term: 'сотрудники',
        convention: 'Множество сотрудников; подстановка R1→X1 в шаблонах БВ'
      }
    },
    {
      draft: {
        id: X2_ID,
        alias: 'X2',
        cstType: CstType.BASE,
        definitionFormal: '',
        term: 'проекты',
        convention: 'Множество проектов; подстановка R2→X2 в шаблонах БВ'
      }
    },
    {
      draft: {
        id: S1_ID,
        alias: 'S1',
        cstType: CstType.STRUCTURED,
        definitionFormal: 'ℬ(X1×X2)',
        term: 'назначение на проект',
        convention: 'σ в шаблонах БВ для бинарных отношений двух множеств'
      }
    },
    {
      draft: {
        id: S2_ID,
        alias: 'S2',
        cstType: CstType.STRUCTURED,
        definitionFormal: 'ℬ(X1×X1)',
        term: 'подчинённость',
        convention: 'σ в шаблонах БВ для бинарных отношений на одном множестве'
      }
    },
    {
      draft: {
        id: F_IMAGE_ID,
        alias: 'F_IMAGE',
        cstType: CstType.FUNCTION,
        definitionFormal: '[α∈X1, σ∈ℬ(X1×X2)] Pr2(Fi1[{α}](σ))',
        term: 'проекты сотрудника',
        convention: 'БВ F6: R1→X1, R2→X2'
      }
    },
    {
      draft: {
        id: F_SOURCES_ID,
        alias: 'F_SOURCES',
        cstType: CstType.FUNCTION,
        definitionFormal: '[σ∈ℬ(X1×X1)] Pr1(σ) \\ Pr2(σ)',
        term: 'вершины без предшественников',
        convention: 'БВ F20 (истоки графа подчинённости)'
      }
    },
    {
      draft: {
        id: P_FUNCTION_ID,
        alias: 'P_FUNCTION',
        cstType: CstType.PREDICATE,
        definitionFormal: '[α∈ℬ(X1), σ∈ℬ(X1×X2)] card(Pr1(σ)) = card(σ) & Pr1(σ) = α',
        term: 'тотальная функция X1→X2',
        convention: 'БВ P5'
      }
    },
    {
      draft: {
        id: D1_ID,
        alias: 'D1',
        cstType: CstType.TERM,
        definitionFormal: 'Pr2(Fi1[X1](S1))',
        term: 'все назначенные проекты',
        convention: 'БВ F9: образ множества X1 по S1'
      }
    },
    {
      draft: {
        id: D2_ID,
        alias: 'D2',
        cstType: CstType.TERM,
        definitionFormal: 'Pr1(S2) \\ Pr2(S2)',
        term: 'глава иерархии',
        convention: 'БВ F20: применение к S2 (развёрнуто в D2, т.к. вызов F# в терме не анализируется)'
      }
    }
  ];

  const patch = await client.call<{
    success: boolean;
    summary: { items: Array<{ alias: string; analysisSuccess: boolean }> };
    failed: Array<{ draft: { alias: string } }>;
  }>('applySchemaPatch', {
    sessionId: session.sessionId,
    mode: 'atomic',
    items: drafts.map(entry => entry.draft)
  });
  if (!patch.success) {
    const failedAlias = patch.failed[0]?.draft.alias ?? 'unknown';
    throw new Error(`${failedAlias}: analysis failed`);
  }
  for (const item of patch.summary.items) {
    console.log(`${item.alias}: OK`);
  }

  await client.call('setModelValues', {
    sessionId: session.sessionId,
    set: [
      { target: X1_ID, value: X1_BINDING },
      { target: X2_ID, value: X2_BINDING },
      { target: S1_ID, value: S1_VALUE },
      { target: S2_ID, value: S2_VALUE }
    ]
  });
  await client.call('recalculateModel', { sessionId: session.sessionId });

  await assertCleanDiagnostics(
    client,
    session.sessionId,
    new Map(drafts.map(entry => [entry.draft.id!, entry.draft.alias])),
    'template-apply'
  );

  await client.call('commitStep', {
    sessionId: session.sessionId,
    message: 'Применение шаблонов БВ: сотрудники, проекты, F6/F9/F20/P5'
  });

  return session.sessionId;
}

async function verifyModel(client: RSToolWrapperClient, schemaJson: string) {
  const imported = await client.call<{ sessionId: string }>('importData', {
    payload: schemaJson
  });

  await client.call('setModelValues', {
    sessionId: imported.sessionId,
    set: [
      { target: X1_ID, value: X1_BINDING },
      { target: X2_ID, value: X2_BINDING },
      { target: S1_ID, value: S1_VALUE },
      { target: S2_ID, value: S2_VALUE }
    ]
  });

  const recalculated = await client.call<{
    items: { id: number; alias: string; value: unknown; status: number }[];
  }>('recalculateModel', {
    sessionId: imported.sessionId
  });

  const d1 = recalculated.items.find(item => item.id === D1_ID);
  const d2 = recalculated.items.find(item => item.id === D2_ID);

  console.log('D1 (все проекты):', d1);
  console.log('D2 (истоки S2):', d2);

  if (!Array.isArray(d1?.value) || !d1.value.includes(0) || !d1.value.includes(1)) {
    throw new Error(`Expected D1 to include projects 0 and 1; got ${JSON.stringify(d1)}`);
  }

  if (!Array.isArray(d2?.value) || d2.value.length !== 1 || d2.value[0] !== 0) {
    throw new Error(`Expected D2 = {0}; got ${JSON.stringify(d2)}`);
  }

  if (d1?.status !== EvalStatus.HAS_DATA) {
    throw new Error(`Expected D1 status HAS_DATA; got ${d1?.status}`);
  }

  console.log('Model verification: OK');
}

async function run() {
  const client = new RSToolWrapperClient({
    cwd: resolve(process.cwd())
  });

  try {
    await client.waitUntilReady();
    const sessionId = await buildSchema(client);

    const exported = await client.call<string>('exportSession', { sessionId });
    const outputPath = resolve(process.cwd(), DEFAULT_RSFORM_SESSION_PATH);
    await writeFile(outputPath, exported, 'utf8');
    console.log(`Exported: ${outputPath}`);

    await verifyModel(client, exported);
  } finally {
    await client.close();
  }
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
