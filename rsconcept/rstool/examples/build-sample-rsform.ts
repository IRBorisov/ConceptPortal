import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { CstType, RSToolWrapperClient, type AddOrUpdateConstituentaInput } from '../src';

async function run() {
  const client = new RSToolWrapperClient({
    cwd: resolve(process.cwd())
  });

  try {
    await client.waitUntilReady();
    const session = await client.call<{ sessionId: string; contractVersion: string }>('createSession');

    const drafts: AddOrUpdateConstituentaInput[] = [
      {
        draft: {
          id: 1,
          alias: 'X1',
          cstType: CstType.BASE,
          definitionFormal: ''
        }
      },
      {
        draft: {
          id: 2,
          alias: 'C1',
          cstType: CstType.CONSTANT,
          definitionFormal: ''
        }
      },
      {
        draft: {
          id: 3,
          alias: 'D1',
          cstType: CstType.TERM,
          definitionFormal: 'X1×X1'
        }
      },
      {
        draft: {
          id: 4,
          alias: 'A1',
          cstType: CstType.AXIOM,
          definitionFormal: '1=1'
        }
      }
    ];

    for (const input of drafts) {
      const result = await client.call('addOrUpdateConstituenta', {
        sessionId: session.sessionId,
        input
      });
      console.log(
        `Added ${input.draft.alias}:`,
        (result as { diagnostics?: unknown[] }).diagnostics?.length ?? 0,
        'diagnostics'
      );
    }

    await client.call('commitStep', {
      sessionId: session.sessionId,
      message: 'Built sample RSForm'
    });

    const exported = await client.call<string>('exportSession', {
      sessionId: session.sessionId
    });
    const outputPath = resolve(process.cwd(), 'examples', 'sample-rsform-session.json');
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
