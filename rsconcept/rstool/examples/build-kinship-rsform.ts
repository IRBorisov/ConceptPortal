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
          definitionText:
            'Для человека ξ — множество его родителей (первая проекция пар из S1, у которых вторая проекция равна ξ).'
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
          id: 13,
          alias: 'S2',
          cstType: CstType.STRUCTURED,
          definitionFormal: 'ℬ(X1)',
          term: 'мужчины',
          convention:
            'Пол устанавливается по документам; каждый индивид из X1 входит ровно в одно из множеств S2 или S3.'
        }
      },
      {
        draft: {
          id: 14,
          alias: 'S3',
          cstType: CstType.STRUCTURED,
          definitionFormal: 'ℬ(X1)',
          term: 'женщины',
          convention:
            'Пол устанавливается по документам; каждый индивид из X1 входит ровно в одно из множеств S2 или S3.'
        }
      },
      {
        draft: {
          id: 15,
          alias: 'A2',
          cstType: CstType.AXIOM,
          definitionFormal: 'S2∪S3=X1 & S2∩S3=∅',
          term: 'разбиение людей по полу',
          definitionText: 'Каждый человек — мужчина или женщина, но не оба сразу: S2 и S3 образуют разбиение X1.'
        }
      },
      {
        draft: {
          id: 16,
          alias: 'F7',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] F1[ξ]∩S2',
          term: 'отцы данного человека',
          definitionText: 'Родители ξ, являющиеся мужчинами.'
        }
      },
      {
        draft: {
          id: 17,
          alias: 'F8',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] F1[ξ]∩S3',
          term: 'матери данного человека',
          definitionText: 'Родители ξ, являющиеся женщинами.'
        }
      },
      {
        draft: {
          id: 18,
          alias: 'A3',
          cstType: CstType.AXIOM,
          definitionFormal: '∀ξ∈X1 (card(F7[ξ])≤1 & card(F8[ξ])≤1)',
          term: 'не более одного отца и одной матери',
          definitionText: 'У каждого человека не более одного отца и не более одной матери.'
        }
      },
      {
        draft: {
          id: 19,
          alias: 'F9',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] F3[ξ]∩S2',
          term: 'братья данного человека',
          definitionText: 'Братья и сёстры ξ (F3), являющиеся мужчинами.'
        }
      },
      {
        draft: {
          id: 20,
          alias: 'F10',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] F3[ξ]∩S3',
          term: 'сёстры данного человека',
          definitionText: 'Братья и сёстры ξ (F3), являющиеся женщинами.'
        }
      },
      {
        draft: {
          id: 21,
          alias: 'F11',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] D{μ∈F3[ξ] | F1[ξ]=F1[μ]}',
          term: 'полнородные братья и сёстры',
          definitionText: 'Сиблинги с полностью совпадающими множествами родителей.'
        }
      },
      {
        draft: {
          id: 22,
          alias: 'F12',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] F11[ξ]∩S2',
          term: 'полнородные братья',
          definitionText: 'Полнородные сиблинги ξ, являющиеся мужчинами.'
        }
      },
      {
        draft: {
          id: 23,
          alias: 'F13',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] F11[ξ]∩S3',
          term: 'полнородные сёстры',
          definitionText: 'Полнородные сиблинги ξ, являющиеся женщинами.'
        }
      },
      {
        draft: {
          id: 24,
          alias: 'F14',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] D{μ∈F3[ξ] | F7[ξ]=F7[μ] & F8[ξ]≠F8[μ]}',
          term: 'единокровные братья и сёстры',
          definitionText: 'Сиблинги с общим отцом и разными матерями.'
        }
      },
      {
        draft: {
          id: 25,
          alias: 'F15',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] F14[ξ]∩S2',
          term: 'единокровные братья',
          definitionText: 'Единокровные сиблинги ξ, являющиеся мужчинами.'
        }
      },
      {
        draft: {
          id: 26,
          alias: 'F16',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] F14[ξ]∩S3',
          term: 'единокровные сёстры',
          definitionText: 'Единокровные сиблинги ξ, являющиеся женщинами.'
        }
      },
      {
        draft: {
          id: 27,
          alias: 'F17',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] D{μ∈F3[ξ] | F7[ξ]≠F7[μ] & F8[ξ]=F8[μ]}',
          term: 'единоутробные братья и сёстры',
          definitionText: 'Сиблинги с общей матерью и разными отцами.'
        }
      },
      {
        draft: {
          id: 28,
          alias: 'F18',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] F17[ξ]∩S2',
          term: 'единоутробные братья',
          definitionText: 'Единоутробные сиблинги ξ, являющиеся мужчинами.'
        }
      },
      {
        draft: {
          id: 29,
          alias: 'F19',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] F17[ξ]∩S3',
          term: 'единоутробные сёстры',
          definitionText: 'Единоутробные сиблинги ξ, являющиеся женщинами.'
        }
      },
      {
        draft: {
          id: 30,
          alias: 'F20',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] F6[{ξ}]∩S2',
          term: 'сыновья данного человека',
          definitionText: 'Прямые дети ξ, являющиеся мужчинами.'
        }
      },
      {
        draft: {
          id: 31,
          alias: 'F21',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] F6[{ξ}]∩S3',
          term: 'дочери данного человека',
          definitionText: 'Прямые дети ξ, являющиеся женщинами.'
        }
      },
      {
        draft: {
          id: 32,
          alias: 'F22',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] F6[F6[{ξ}]]∩S2',
          term: 'внуки данного человека',
          definitionText: 'Внуки-мужчины: мужчины среди детей детей ξ.'
        }
      },
      {
        draft: {
          id: 33,
          alias: 'F23',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] F6[F6[{ξ}]]∩S3',
          term: 'внучки данного человека',
          definitionText: 'Внучки: женщины среди детей детей ξ.'
        }
      },
      {
        draft: {
          id: 34,
          alias: 'F24',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] D{μ∈X1 | ∃p∈F1[ξ] μ∈F7[p]}',
          term: 'дедушки данного человека',
          definitionText: 'Отцы родителей ξ.'
        }
      },
      {
        draft: {
          id: 35,
          alias: 'F25',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] D{μ∈X1 | ∃p∈F1[ξ] μ∈F8[p]}',
          term: 'бабушки данного человека',
          definitionText: 'Матери родителей ξ.'
        }
      },
      {
        draft: {
          id: 36,
          alias: 'F26',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] F4[ξ]∩S2',
          term: 'племянники данного человека (мужчины)',
          definitionText: 'Племянники ξ (F4), являющиеся мужчинами.'
        }
      },
      {
        draft: {
          id: 37,
          alias: 'F27',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] F4[ξ]∩S3',
          term: 'племянницы данного человека',
          definitionText: 'Племянники ξ (F4), являющиеся женщинами.'
        }
      },
      {
        draft: {
          id: 38,
          alias: 'F28',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] D{ν∈X1 | ∃p∈F1[ξ] ∃κ∈F3[p] ν∈F6[{κ}]}',
          term: 'двоюродные братья и сёстры',
          definitionText: 'Дети братьев и сестёр родителей ξ.'
        }
      },
      {
        draft: {
          id: 39,
          alias: 'F29',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] F28[ξ]∩S2',
          term: 'двоюродные братья',
          definitionText: 'Двоюродные сиблинги ξ, являющиеся мужчинами.'
        }
      },
      {
        draft: {
          id: 40,
          alias: 'F30',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] F28[ξ]∩S3',
          term: 'двоюродные сёстры',
          definitionText: 'Двоюродные сиблинги ξ, являющиеся женщинами.'
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
        throw new Error(`${input.draft.alias}: analysis failed (${diagCount} diagnostics): ${JSON.stringify(diags)}`);
      }
    }

    await client.call('commitStep', {
      sessionId: session.sessionId,
      message:
        'КС «родственные отношения»: пол (S2/S3), отцы/матери, разновидности сиблингов, внуки, дедушки/бабушки, двоюродные'
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
