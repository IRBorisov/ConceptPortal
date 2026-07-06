import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { TUPLE_ID } from '@rsconcept/domain';

import { CstType, RSToolWrapperClient, type AgentConstituentaPatch, type ApplySchemaPatchResult } from '../../src';

import { assertCleanDiagnostics } from '../diagnostics-utils';

async function run() {
  const client = new RSToolWrapperClient({
    cwd: resolve(process.cwd())
  });

  try {
    await client.waitUntilReady();
    const session = await client.call<{ sessionId: string; contractVersion: string }>('createSession');

    const items: AgentConstituentaPatch[] = [
      { id: 1, alias: 'X1', cstType: CstType.BASE, definitionFormal: '', term: 'element', convention: 'people' },
      {
        id: 2,
        alias: 'C1',
        cstType: CstType.CONSTANT,
        definitionFormal: '',
        term: 'count',
        convention: 'natural numbers'
      },
      {
        id: 3,
        alias: 'S1',
        cstType: CstType.STRUCTURED,
        definitionFormal: 'ℬ(X1×X1)',
        term: 'parent-child pairs',
        convention: 'Pairs (parent, child) over X1.'
      },
      { id: 4, alias: 'D1', cstType: CstType.TERM, definitionFormal: 'Pr1(S1)' },
      { id: 5, alias: 'A1', cstType: CstType.AXIOM, definitionFormal: '1=1' }
    ];

    const result = await client.call<ApplySchemaPatchResult>('applySchemaPatch', {
      sessionId: session.sessionId,
      items
    });
    for (const item of result.summary.items) {
      console.log(`Added ${item.alias}`);
    }
    const diags = await client.call<Array<{ kind: string; error: { code: number } }>>('listDiagnostics', {
      sessionId: session.sessionId
    });
    const counts = { expression: 0, schema: 0, model: 0 };
    for (const record of diags) {
      if (record.kind in counts) {
        counts[record.kind as keyof typeof counts] += 1;
      }
    }
    console.log(
      `Patch diagnostics: ${result.diagnostics.length} (expression ${counts.expression}, schema ${counts.schema}, model ${counts.model})`
    );

    await client.call('setModelValues', {
      sessionId: session.sessionId,
      set: [
        { target: 1, value: { 0: 'alice', 1: 'bob' } },
        { target: 2, value: { 0: 'zero', 1: 'one', 2: 'two' } },
        { target: 3, value: [[TUPLE_ID, 0, 1]] }
      ]
    });
    await client.call('recalculateModel', { sessionId: session.sessionId });

    await assertCleanDiagnostics(
      client,
      session.sessionId,
      new Map(items.map(item => [item.id!, item.alias])),
      'sample RSForm'
    );

    await client.call('commitStep', {
      sessionId: session.sessionId,
      message: 'Built sample RSForm'
    });

    const exported = await client.call<string>('exportSession', {
      sessionId: session.sessionId
    });
    const outputPath = resolve(process.cwd(), 'examples', 'sample', 'rsform-session.json');
    await writeFile(outputPath, exported, 'utf8');
    console.log(`Sample RSForm exported: ${outputPath}`);
  } finally {
    await client.close();
  }
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
