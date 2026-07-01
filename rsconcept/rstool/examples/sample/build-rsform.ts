import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

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

    const result = await client.call<{ diagnostics: unknown[]; summary: { items: { alias: string }[] } }>(
      'applySchemaPatch',
      {
        sessionId: session.sessionId,
        items
      }
    );
    for (const item of result.summary.items) {
      console.log(`Added ${item.alias}:`, result.diagnostics?.length ?? 0, 'diagnostics');
    }

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
