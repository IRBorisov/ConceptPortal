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
          definitionFormal: '',
          term: 'люди',
          convention: 'Базисное множество людей предметной области «родственные отношения».'
        }
      },
      {
        draft: {
          id: 2,
          alias: 'S1',
          cstType: CstType.STRUCTURED,
          definitionFormal: 'ℬ(X1×X1)',
          term: 'родитель-ребенок',
          convention:
            'Элементы — пары (p, c): p — родитель, c — ребёнок; p, c ∈ X1. Отношение задаётся конвенцией на предметной области.'
        }
      },
      {
        draft: {
          id: 3,
          alias: 'D1',
          cstType: CstType.TERM,
          definitionFormal: 'Pr1(S1)',
          term: 'родители',
          definitionText: 'Множество людей, выступающих в роли родителя хотя бы для одного ребёнка.'
        }
      },
      {
        draft: {
          id: 4,
          alias: 'F1',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] Pr1(Fi2[{ξ}](S1))',
          term: 'родители данного человека',
          definitionText: 'Для человека ξ — множество его родителей (первая проекция пар из S1, у которых вторая проекция равна ξ).'
        }
      },
      {
        draft: {
          id: 10,
          alias: 'F6',
          cstType: CstType.FUNCTION,
          definitionFormal: '[σ∈ℬ(X1)] Pr2(Fi1[σ](S1))',
          term: 'дети',
          definitionText:
            'Прямые дети людей из σ: вторая проекция пар из S1, у которых родитель (первая проекция) лежит в σ. Для одного человека ξ используют F6[{ξ}].'
        }
      },
      {
        draft: {
          id: 5,
          alias: 'D2',
          cstType: CstType.TERM,
          definitionFormal: 'Pr2(S1)',
          term: 'потомки',
          definitionText:
            'Множество людей, выступающих ребёнком хотя бы в одной паре из S1 (симметрично терму «родители»).'
        }
      },
      {
        draft: {
          id: 6,
          alias: 'F2',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] R{ρ:=F6[{ξ}] | ρ≠∅ | ρ∪F6[ρ]}',
          term: 'потомки данного человека',
          definitionText:
            'Для человека ξ — транзитивное замыкание отношения «ребёнок»: прямые дети, внуки и все последующие поколения.'
        }
      },
      {
        draft: {
          id: 7,
          alias: 'F3',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] D{μ∈X1 | ∃p∈F1[ξ] μ∈F1[p] & μ≠ξ}',
          term: 'братья и сестры данного человека',
          definitionText:
            'Люди μ ≠ ξ, у которых есть общий с ξ родитель (в т.ч. сводные братья и сестры при одном общем родителе).'
        }
      },
      {
        draft: {
          id: 8,
          alias: 'F4',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] D{κ∈X1 | ∃μ∈F3[ξ] κ∈F6[{μ}] & κ∉F2[ξ]}',
          term: 'племянники данного человека',
          definitionText: 'Прямые дети братьев и сестёр ξ, не входящие в множество потомков самого ξ.'
        }
      },
      {
        draft: {
          id: 9,
          alias: 'F5',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] D{ν∈X1 | ∃κ∈F4[ξ] ν∈F6[{κ}]}',
          term: 'внучатые племянники данного человека',
          definitionText:
            'Прямые дети племянников ξ: потомки братьев/сестёр на два поколения ниже (ребёнок племянника или племянницы).'
        }
      },
      {
        draft: {
          id: 11,
          alias: 'D3',
          cstType: CstType.TERM,
          definitionFormal: 'D{ν∈X1 | ∃ξ∈X1 ν∈F5[ξ]}',
          term: 'внучатые племянники',
          definitionText:
            'Множество людей, являющихся внучатыми племянниками или племянницами хотя бы одного человека из X1 (объединение значений F5 по всем ξ).'
        }
      },
      {
        draft: {
          id: 12,
          alias: 'A1',
          cstType: CstType.AXIOM,
          definitionFormal: 'card(X1)≤10',
          term: 'не более десяти человек',
          definitionText: 'В предметной области не более десяти человек: мощность X1 не превышает 10.'
        }
      }
    ];

    for (const input of drafts) {
      const result = await client.call<{
        state: { alias: string; analysis: { success: boolean } };
        diagnostics: unknown[];
      }>('addOrUpdateConstituenta', {
        sessionId: session.sessionId,
        input
      });
      const ok = result.state.analysis.success;
      const diagCount = result.diagnostics?.length ?? 0;
      console.log(`${input.draft.alias}: ${ok ? 'OK' : 'FAIL'} (${diagCount} diagnostics)`);
      if (!ok) {
        const diags = await client.call('listDiagnostics', { sessionId: session.sessionId });
        console.log(JSON.stringify(diags, null, 2));
        throw new Error(
          `${input.draft.alias}: analysis failed (${diagCount} diagnostics): ${JSON.stringify(diags)}`
        );
      }
    }

    await client.call('commitStep', {
      sessionId: session.sessionId,
      message: 'КС «родственные отношения»: D3 «внучатые племянники», F6 «дети», A1 «не более 10 человек»'
    });

    const exported = await client.call<string>('exportSession', {
      sessionId: session.sessionId
    });
    const outputPath = resolve(process.cwd(), 'examples', 'kinship-rsform-session.json');
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
