import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { CstType, RSToolWrapperClient, type AgentConstituentaPatch } from '../../src';

type DraftBatch = { draft: AgentConstituentaPatch };

import { DEFAULT_RSFORM_SESSION_PATH } from './constants';
import { MOVD_MODEL_SET } from './model-demo';
import { assertCleanDiagnostics } from '../diagnostics-utils';

/**
 * Учебная RSForm «МОВД» по Portal rsforms/838 (сокращённо).
 * Фокус: мультипроекции Pr*,* и мультифильтры Fi*,* на отношениях арности 3.
 */
async function run() {
  const client = new RSToolWrapperClient({
    cwd: resolve(process.cwd())
  });

  try {
    await client.waitUntilReady();
    const session = await client.call<{ sessionId: string; contractVersion: string }>('createSession');

    const drafts: DraftBatch[] = [
      {
        draft: {
          id: 1,
          alias: 'X1',
          cstType: CstType.BASE,
          definitionFormal: '',
          term: 'ситуации',
          convention: 'Различимые ситуации, рассматриваемые как единицы анализа'
        }
      },
      {
        draft: {
          id: 2,
          alias: 'X2',
          cstType: CstType.BASE,
          definitionFormal: '',
          term: 'элементы ситуации',
          convention: 'Различимые элементы, которые могут входить в состав ситуаций'
        }
      },
      {
        draft: {
          id: 3,
          alias: 'X3',
          cstType: CstType.BASE,
          definitionFormal: '',
          term: 'субъекты',
          convention: 'Различимые субъекты, осуществляющие ориентировку в ситуации'
        }
      },
      {
        draft: {
          id: 4,
          alias: 'X4',
          cstType: CstType.BASE,
          definitionFormal: '',
          term: 'действия',
          convention: 'Различимые действия, рассматриваемые субъектом как возможные в ситуации'
        }
      },
      {
        draft: {
          id: 5,
          alias: 'S1',
          cstType: CstType.STRUCTURED,
          definitionFormal: 'ℬ(X1×X2)',
          term: 'состав ситуации',
          convention: 'Соотносит ситуацию с элементами, входящими в её состав'
        }
      },
      {
        draft: {
          id: 6,
          alias: 'S2',
          cstType: CstType.STRUCTURED,
          definitionFormal: 'ℬ(X3×X1×X2)',
          term: 'выделение значимого',
          convention: 'Соотносит субъекта, ситуацию и элемент ситуации, выделяемый субъектом как значимый'
        }
      },
      {
        draft: {
          id: 7,
          alias: 'S3',
          cstType: CstType.STRUCTURED,
          definitionFormal: 'ℬ(X3×X1×X4)',
          term: 'рассмотрение действия',
          convention: 'Соотносит субъекта, ситуацию и действие, рассматриваемое как возможное'
        }
      },
      {
        draft: {
          id: 8,
          alias: 'S4',
          cstType: CstType.STRUCTURED,
          definitionFormal: 'ℬ(X3×X1×X4)',
          term: 'выбор действия',
          convention: 'Соотносит субъекта, ситуацию и действие, выбранное субъектом'
        }
      },
      {
        draft: {
          id: 9,
          alias: 'D1',
          cstType: CstType.TERM,
          definitionFormal: 'Pr1(S1)',
          term: 'структурированные ситуации',
          definitionText: 'Ситуации, для которых задан хотя бы один элемент состава'
        }
      },
      {
        draft: {
          id: 10,
          alias: 'D2',
          cstType: CstType.TERM,
          definitionFormal: 'Pr2(S1)',
          term: 'элементы состава ситуации',
          definitionText: 'Элементы, входящие в состав хотя бы одной ситуации'
        }
      },
      {
        draft: {
          id: 11,
          alias: 'F1',
          cstType: CstType.FUNCTION,
          definitionFormal: '[α∈X1] Pr2(Fi1[{α}](S1))',
          term: 'состав заданной ситуации',
          definitionText: 'Элементы, входящие в состав заданной ситуации'
        }
      },
      {
        draft: {
          id: 12,
          alias: 'D3',
          cstType: CstType.TERM,
          definitionFormal: 'Pr1(S2)',
          term: 'ориентирующиеся субъекты'
        }
      },
      {
        draft: {
          id: 13,
          alias: 'D4',
          cstType: CstType.TERM,
          definitionFormal: 'Pr2(S2)',
          term: 'ситуации ориентировки'
        }
      },
      {
        draft: {
          id: 14,
          alias: 'D5',
          cstType: CstType.TERM,
          definitionFormal: 'Pr3(S2)',
          term: 'значимые элементы'
        }
      },
      {
        draft: {
          id: 15,
          alias: 'D6',
          cstType: CstType.TERM,
          definitionFormal: 'Pr1,2(S2)',
          term: 'эпизоды ориентировки',
          definitionText: 'Пары субъект — ситуация, в которых субъект выделяет значимый элемент'
        }
      },
      {
        draft: {
          id: 16,
          alias: 'F2',
          cstType: CstType.FUNCTION,
          definitionFormal: '[α∈X3, β∈X1] Pr3(Fi2,1[{(β,α)}](S2))',
          term: 'значимые элементы субъекта в ситуации',
          definitionText: 'Элементы, выделяемые субъектом как значимые в заданной ситуации'
        }
      },
      {
        draft: {
          id: 17,
          alias: 'A1',
          cstType: CstType.AXIOM,
          definitionFormal: '∀α∈X3 ∀β∈X1 F2[α,β]⊆F1[β]',
          term: 'значимые элементы входят в состав ситуации',
          definitionText: 'Элементы, выделяемые субъектом как значимые, входят в состав этой ситуации'
        }
      },
      {
        draft: {
          id: 18,
          alias: 'D7',
          cstType: CstType.TERM,
          definitionFormal: 'Pr1(S3)',
          term: 'рассматривающие субъекты'
        }
      },
      {
        draft: {
          id: 19,
          alias: 'D8',
          cstType: CstType.TERM,
          definitionFormal: 'Pr2(S3)',
          term: 'ситуации рассмотрения действий'
        }
      },
      {
        draft: {
          id: 20,
          alias: 'D9',
          cstType: CstType.TERM,
          definitionFormal: 'Pr3(S3)',
          term: 'рассматриваемые действия'
        }
      },
      {
        draft: {
          id: 21,
          alias: 'F3',
          cstType: CstType.FUNCTION,
          definitionFormal: '[α∈X3, β∈X1] Pr3(Fi2[{β}](Fi1[{α}](S3)))',
          term: 'пространство действий субъекта в ситуации',
          definitionText: 'Действия, рассматриваемые субъектом как возможные в ситуации'
        }
      },
      {
        draft: {
          id: 22,
          alias: 'A2',
          cstType: CstType.AXIOM,
          definitionFormal: '∀α∈X3 ∀β∈X1 (F3[α,β]≠∅ ⇒ F2[α,β]≠∅)',
          term: 'пространство действий требует ориентировки',
          definitionText: 'Если субъект рассматривает действия в ситуации, у него есть значимые элементы'
        }
      },
      {
        draft: {
          id: 23,
          alias: 'D10',
          cstType: CstType.TERM,
          definitionFormal: 'Pr1,2(S3)',
          term: 'эпизоды рассмотрения',
          definitionText: 'Пары субъект — ситуация, в которых рассматриваются действия'
        }
      },
      {
        draft: {
          id: 24,
          alias: 'F5',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ρ∈S3] pr1,2(ρ)',
          term: 'субъект и ситуация рассмотрения',
          definitionText: 'Пара субъект — ситуация для эпизода рассмотрения действия'
        }
      },
      {
        draft: {
          id: 25,
          alias: 'F4',
          cstType: CstType.FUNCTION,
          definitionFormal: '[α∈X3, β∈X1] debool(Pr3(Fi2[{β}](Fi1[{α}](S4))))',
          term: 'выбранное действие субъекта в ситуации',
          definitionText: 'Действие, выбранное субъектом в ситуации'
        }
      },
      {
        draft: {
          id: 26,
          alias: 'A3',
          cstType: CstType.AXIOM,
          definitionFormal: '∀(α,β)∈Pr1,2(S4) card(Pr3(Fi2[{β}](Fi1[{α}](S4))))=1',
          term: 'единственность выбранного действия',
          definitionText: 'У каждой пары субъект — ситуация в структуре выбора ровно одно действие'
        }
      },
      {
        draft: {
          id: 27,
          alias: 'A4',
          cstType: CstType.AXIOM,
          definitionFormal: '∀(α,β)∈Pr1,2(S4) F4[α,β]∈F3[α,β]',
          term: 'выбранное действие принадлежит пространству действий',
          definitionText: 'Выбранное действие входит в число рассматриваемых субъектом в этой ситуации'
        }
      }
    ];

    const patch = await client.call<{
      success: boolean;
      diagnostics: unknown[];
      failed: Array<{ draft: { alias: string }; diagnostics: unknown[] }>;
      summary: { items: Array<{ alias: string; analysisSuccess: boolean }> };
    }>('applySchemaPatch', {
      sessionId: session.sessionId,
      mode: 'atomic',
      items: drafts.map(entry => entry.draft)
    });

    for (const item of patch.summary.items) {
      console.log(`${item.alias}: ${item.analysisSuccess ? 'OK' : 'FAIL'}`);
    }
    if (!patch.success) {
      const diags = await client.call('listDiagnostics', { sessionId: session.sessionId });
      console.log(JSON.stringify(diags, null, 2));
      const failedAlias = patch.failed[0]?.draft.alias ?? 'unknown';
      throw new Error(`${failedAlias}: analysis failed`);
    }

    await client.call('setModelValues', {
      sessionId: session.sessionId,
      set: [...MOVD_MODEL_SET]
    });
    await client.call('recalculateModel', { sessionId: session.sessionId });

    await assertCleanDiagnostics(
      client,
      session.sessionId,
      new Map(drafts.map(entry => [entry.draft.id!, entry.draft.alias])),
      'movd RSForm'
    );

    await client.call('commitStep', {
      sessionId: session.sessionId,
      message: 'КС «МОВД» (rsforms/838): Pr1,2, Fi1,2, pr1,2 на ℬ(X3×X1×X2) и ℬ(X3×X1×X4)'
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
