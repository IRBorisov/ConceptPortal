import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { TUPLE_ID } from '@rsconcept/domain';

import { CstType, RSToolWrapperClient, type AgentConstituentaPatch } from '../../src';

async function run() {
  const client = new RSToolWrapperClient({
    cwd: resolve(process.cwd())
  });

  try {
    await client.waitUntilReady();
    const session = await client.call<{ sessionId: string; contractVersion: string }>('createSession');

    const items: AgentConstituentaPatch[] = [
      { id: 1, alias: 'X1', cstType: CstType.BASE, definitionFormal: '' },
      { id: 2, alias: 'C1', cstType: CstType.CONSTANT, definitionFormal: '' },
      {
        id: 3,
        alias: 'S1',
        cstType: CstType.STRUCTURED,
        definitionFormal: 'ℬ(X1×X1)',
        convention: 'Pairs (parent, child) over X1.'
      },
      { id: 4, alias: 'D1', cstType: CstType.TERM, definitionFormal: 'Pr1(S1)' },
      { id: 5, alias: 'A1', cstType: CstType.AXIOM, definitionFormal: '1=1' }
    ];

    await client.call('applySchemaPatch', {
      sessionId: session.sessionId,
      items
    });

    const model = await client.call('setModelValues', {
      sessionId: session.sessionId,
      set: [
        { target: 1, value: { 0: 'alice', 1: 'bob' } },
        { target: 2, value: { 0: 'zero', 1: 'one', 2: 'two' } },
        { target: 3, value: [[TUPLE_ID, 0, 1]] }
      ]
    });
    console.log('Model values set:', model);

    const d1Eval = await client.call('evaluate', {
      sessionId: session.sessionId,
      constituentId: 4
    });
    console.log('D1 (Pr1(S1)) evaluation:', d1Eval);

    const a1Eval = await client.call('evaluate', {
      sessionId: session.sessionId,
      constituentId: 5
    });
    console.log('A1 (1=1) evaluation:', a1Eval);

    const recalculated = await client.call('recalculateModel', {
      sessionId: session.sessionId
    });
    const recalculatedItems = (recalculated as { items: { alias: string; status: number }[] }).items;
    console.log(
      'Recalculated model:',
      recalculatedItems.map(item => ({ alias: item.alias, status: item.status }))
    );

    await client.call('commitStep', {
      sessionId: session.sessionId,
      message: 'Built sample RSModel'
    });

    const exported = await client.call<string>('exportSession', {
      sessionId: session.sessionId
    });
    const outputPath = resolve(process.cwd(), 'examples', 'sample', 'rsmodel-session.json');
    await writeFile(outputPath, exported, 'utf8');
    console.log(`Sample RSModel exported: ${outputPath}`);
  } finally {
    await client.close();
  }
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
