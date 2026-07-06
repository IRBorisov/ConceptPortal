import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { CstType, RSToolWrapperClient, type AgentConstituentaPatch } from '../../src';

type DraftBatch = { draft: AgentConstituentaPatch };

import { DEFAULT_RSFORM_SESSION_PATH } from './constants';
import { KINSHIP_MODEL_SET } from './model-demo';
import { assertCleanDiagnostics } from '../diagnostics-utils';

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
          convention: 'Множество пар: родитель и его ребёнок. Порядок в паре задаётся конвенцией на предметной области.'
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
          definitionText: ''
        }
      },
      {
        draft: {
          id: 10,
          alias: 'F6',
          cstType: CstType.FUNCTION,
          definitionFormal: '[σ∈ℬ(X1)] Pr2(Fi1[σ](S1))',
          term: 'дети',
          definitionText: 'Совокупность детей людей, одним из родителей которых является человек из данной группы людей'
        }
      },
      {
        draft: {
          id: 5,
          alias: 'D2',
          cstType: CstType.TERM,
          definitionFormal: 'Pr2(S1)',
          term: 'потомки',
          definitionText: 'Люди, являющиеся ребёнком хотя бы в одном отношении родитель — ребёнок'
        }
      },
      {
        draft: {
          id: 6,
          alias: 'F2',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] R{ρ:=F6[{ξ}] | ρ≠∅ | ρ∪F6[ρ]}',
          term: 'потомки данного человека',
          definitionText: 'Дети людей данного человека или дети людей его потомков'
        }
      },
      {
        draft: {
          id: 7,
          alias: 'F3',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] Pr2(Fi1[F1[ξ]](S1))\\{ξ}',
          term: 'братья и сестры данного человека',
          definitionText: 'Дети людей родителей данного человека за исключением его самого'
        }
      },
      {
        draft: {
          id: 8,
          alias: 'F4',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] D{κ∈X1 | ∃μ∈F3[ξ] κ∈F6[{μ}] & κ∉F2[ξ]}',
          term: 'племянники данного человека',
          definitionText: 'Прямые дети братьев и сестёр данного человека, не являющиеся его потомками'
        }
      },
      {
        draft: {
          id: 9,
          alias: 'F5',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] D{ν∈X1 | ∃κ∈F4[ξ] ν∈F6[{κ}]}',
          term: 'внучатые племянники данного человека',
          definitionText: 'Прямые дети племянников и племянниц данного человека'
        }
      },
      {
        draft: {
          id: 11,
          alias: 'D3',
          cstType: CstType.TERM,
          definitionFormal: 'I{ν | ξ:∈X1; ν:∈F5[ξ]}',
          term: 'внучатые племянники',
          definitionText: 'Люди, являющиеся внучатыми племянниками или племянницами хотя бы одного человека'
        }
      },
      {
        draft: {
          id: 13,
          alias: 'S2',
          cstType: CstType.STRUCTURED,
          definitionFormal: 'ℬ(X1)',
          term: 'мужчины',
          convention: 'Пол человека устанавливается в соответствии с документами'
        }
      },
      {
        draft: {
          id: 14,
          alias: 'S3',
          cstType: CstType.STRUCTURED,
          definitionFormal: 'ℬ(X1)',
          term: 'женщины',
          convention: 'Пол человека устанавливается в соответствии с документами'
        }
      },
      {
        draft: {
          id: 15,
          alias: 'A2',
          cstType: CstType.AXIOM,
          definitionFormal: 'S2∪S3=X1 & S2∩S3=∅',
          term: 'разбиение людей по полу',
          definitionText: 'Каждый человек является либо мужчиной, либо женщиной'
        }
      },
      {
        draft: {
          id: 41,
          alias: 'S4',
          cstType: CstType.STRUCTURED,
          definitionFormal: 'ℬ(S2×S3)',
          term: 'браки',
          convention: 'Действующие браки'
        }
      },
      {
        draft: {
          id: 42,
          alias: 'D4',
          cstType: CstType.TERM,
          definitionFormal: 'Pr1(S4)',
          term: 'мужья',
          definitionText: 'Мужчины, состоящие в браке'
        }
      },
      {
        draft: {
          id: 43,
          alias: 'D5',
          cstType: CstType.TERM,
          definitionFormal: 'Pr2(S4)',
          term: 'жены',
          definitionText: 'Женщины, состоящие в браке'
        }
      },
      {
        draft: {
          id: 44,
          alias: 'D6',
          cstType: CstType.TERM,
          definitionFormal: 'Pr1(S4)∪Pr2(S4)',
          term: 'супруги',
          definitionText: 'Люди, состоящие в браке'
        }
      },
      {
        draft: {
          id: 45,
          alias: 'F31',
          cstType: CstType.FUNCTION,
          definitionFormal: '[σ∈ℬ(X1)] Pr1(Fi2[σ](S4))',
          term: 'мужья группы людей',
          definitionText: 'Мужья людей из данной группы людей'
        }
      },
      {
        draft: {
          id: 46,
          alias: 'F32',
          cstType: CstType.FUNCTION,
          definitionFormal: '[σ∈ℬ(X1)] Pr2(Fi1[σ](S4))',
          term: 'жены группы людей',
          definitionText: 'Жёны людей из данной группы людей'
        }
      },
      {
        draft: {
          id: 47,
          alias: 'F33',
          cstType: CstType.FUNCTION,
          definitionFormal: '[σ∈ℬ(X1)] F31[σ]∪F32[σ]',
          term: 'супруги группы людей',
          definitionText: 'Супруги людей из данной группы людей'
        }
      },
      {
        draft: {
          id: 48,
          alias: 'F34',
          cstType: CstType.FUNCTION,
          definitionFormal: '[α∈D5] debool(F31[{α}])',
          term: 'муж жены',
          definitionText: ''
        }
      },
      {
        draft: {
          id: 49,
          alias: 'F35',
          cstType: CstType.FUNCTION,
          definitionFormal: '[α∈D4] debool(F32[{α}])',
          term: 'жена мужа',
          definitionText: ''
        }
      },
      {
        draft: {
          id: 50,
          alias: 'A4',
          cstType: CstType.AXIOM,
          definitionFormal: 'card(S4)=card(D4) & card(S4)=card(D5)',
          term: 'единственность браков',
          definitionText: 'Каждый человек может состоять только в одном браке'
        }
      },
      {
        draft: {
          id: 51,
          alias: 'D7',
          cstType: CstType.TERM,
          definitionFormal: 'D{ξ∈X1 | card(F33[{ξ}]\\{ξ})>1}',
          term: 'люди в нескольких браках',
          definitionText: 'Люди, у которых больше одного супруга'
        }
      },
      {
        draft: {
          id: 55,
          alias: 'D10',
          cstType: CstType.TERM,
          definitionFormal: 'D{ξ∈D2 | F33[F1[ξ]]=F1[ξ]}',
          term: 'законные дети',
          definitionText: 'Дети людей, родители которых состоят в браке'
        }
      },
      {
        draft: {
          id: 56,
          alias: 'D11',
          cstType: CstType.TERM,
          definitionFormal: 'D2\\D10',
          term: 'бастарды',
          definitionText: 'Дети людей, родители которых не состоят в браке'
        }
      },
      {
        draft: {
          id: 54,
          alias: 'D9',
          cstType: CstType.TERM,
          definitionFormal: 'I{(σ, γ) | σ:∈D4; γ:=F35[σ]}',
          term: 'пары муж — жена',
          definitionText: 'Множество пар, состоящих из мужа и его жены'
        }
      },
      {
        draft: {
          id: 53,
          alias: 'D8',
          cstType: CstType.TERM,
          definitionFormal: 'X1\\D2',
          term: 'бездетные люди',
          definitionText: 'Люди, не являющиеся детьми людей'
        }
      },
      {
        draft: {
          id: 52,
          alias: 'A5',
          cstType: CstType.AXIOM,
          definitionFormal: '∀ξ∈X1 ξ∉F2[ξ]',
          term: 'ацикличность родства',
          definitionText: 'Человек не может быть своим потомком'
        }
      },
      {
        draft: {
          id: 16,
          alias: 'F7',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] F1[ξ]∩S2',
          term: 'отцы данного человека',
          definitionText: ''
        }
      },
      {
        draft: {
          id: 17,
          alias: 'F8',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] F1[ξ]∩S3',
          term: 'матери данного человека',
          definitionText: ''
        }
      },
      {
        draft: {
          id: 18,
          alias: 'A3',
          cstType: CstType.AXIOM,
          definitionFormal: '∀ξ∈X1 (card(F7[ξ])≤1 & card(F8[ξ])≤1)',
          term: 'не более одного отца и одной матери',
          definitionText: 'У ребёнка людей может быть максимум один отец и одна мать'
        }
      },
      {
        draft: {
          id: 19,
          alias: 'F9',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] F3[ξ]∩S2',
          term: 'братья данного человека',
          definitionText: 'Братья и сёстры данного человека, являющиеся мужчинами'
        }
      },
      {
        draft: {
          id: 20,
          alias: 'F10',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] F3[ξ]∩S3',
          term: 'сёстры данного человека',
          definitionText: 'Братья и сёстры данного человека, являющиеся женщинами'
        }
      },
      {
        draft: {
          id: 21,
          alias: 'F11',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] D{μ∈F3[ξ] | F1[ξ]=F1[μ]}',
          term: 'полнородные братья и сёстры',
          definitionText: 'Сиблинги данного человека, родители которых полностью совпадают с его родителями'
        }
      },
      {
        draft: {
          id: 22,
          alias: 'F12',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] F11[ξ]∩S2',
          term: 'полнородные братья',
          definitionText: 'Полнородные сиблинги данного человека, являющиеся мужчинами'
        }
      },
      {
        draft: {
          id: 23,
          alias: 'F13',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] F11[ξ]∩S3',
          term: 'полнородные сёстры',
          definitionText: 'Полнородные сиблинги данного человека, являющиеся женщинами'
        }
      },
      {
        draft: {
          id: 24,
          alias: 'F14',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] D{μ∈F3[ξ] | F7[ξ]=F7[μ] & F8[ξ]≠F8[μ]}',
          term: 'единокровные братья и сёстры',
          definitionText: 'Сиблинги, у которых общий отец, но разные матери'
        }
      },
      {
        draft: {
          id: 25,
          alias: 'F15',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] F14[ξ]∩S2',
          term: 'единокровные братья',
          definitionText: 'Единокровные сиблинги данного человека, являющиеся мужчинами'
        }
      },
      {
        draft: {
          id: 26,
          alias: 'F16',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] F14[ξ]∩S3',
          term: 'единокровные сёстры',
          definitionText: 'Единокровные сиблинги данного человека, являющиеся женщинами'
        }
      },
      {
        draft: {
          id: 27,
          alias: 'F17',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] D{μ∈F3[ξ] | F7[ξ]≠F7[μ] & F8[ξ]=F8[μ]}',
          term: 'единоутробные братья и сёстры',
          definitionText: 'Сиблинги, у которых общая мать, но разные отцы'
        }
      },
      {
        draft: {
          id: 28,
          alias: 'F18',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] F17[ξ]∩S2',
          term: 'единоутробные братья',
          definitionText: 'Единоутробные сиблинги данного человека, являющиеся мужчинами'
        }
      },
      {
        draft: {
          id: 29,
          alias: 'F19',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] F17[ξ]∩S3',
          term: 'единоутробные сёстры',
          definitionText: 'Единоутробные сиблинги данного человека, являющиеся женщинами'
        }
      },
      {
        draft: {
          id: 30,
          alias: 'F20',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] F6[{ξ}]∩S2',
          term: 'сыновья данного человека',
          definitionText: 'Дети людей данного человека, являющиеся мужчинами'
        }
      },
      {
        draft: {
          id: 31,
          alias: 'F21',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] F6[{ξ}]∩S3',
          term: 'дочери данного человека',
          definitionText: 'Дети людей данного человека, являющиеся женщинами'
        }
      },
      {
        draft: {
          id: 32,
          alias: 'F22',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] F6[F6[{ξ}]]∩S2',
          term: 'внуки данного человека',
          definitionText: 'Сыновья детей данного человека'
        }
      },
      {
        draft: {
          id: 33,
          alias: 'F23',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] F6[F6[bool(ξ)]]∩S3',
          term: 'внучки данного человека',
          definitionText: 'Дочери детей данного человека'
        }
      },
      {
        draft: {
          id: 34,
          alias: 'F24',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] D{μ∈X1 | ∃p∈F1[ξ] μ∈F7[p]}',
          term: 'дедушки данного человека',
          definitionText: 'Отцы родителей данного человека'
        }
      },
      {
        draft: {
          id: 35,
          alias: 'F25',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] D{μ∈X1 | ∃p∈F1[ξ] μ∈F8[p]}',
          term: 'бабушки данного человека',
          definitionText: 'Матери родителей данного человека'
        }
      },
      {
        draft: {
          id: 36,
          alias: 'F26',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] F4[ξ]∩S2',
          term: 'племянники данного человека (мужчины)',
          definitionText: 'Племянники данного человека, являющиеся мужчинами'
        }
      },
      {
        draft: {
          id: 37,
          alias: 'F27',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] F4[ξ]∩S3',
          term: 'племянницы данного человека',
          definitionText: 'Племянницы данного человека'
        }
      },
      {
        draft: {
          id: 38,
          alias: 'F28',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] D{ν∈X1 | ∃p∈F1[ξ] ∃κ∈F3[p] ν∈F6[{κ}]}',
          term: 'двоюродные братья и сёстры',
          definitionText: 'Дети людей сиблингов родителей данного человека'
        }
      },
      {
        draft: {
          id: 39,
          alias: 'F29',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] F28[ξ]∩S2',
          term: 'двоюродные братья',
          definitionText: 'Двоюродные сиблинги данного человека, являющиеся мужчинами'
        }
      },
      {
        draft: {
          id: 40,
          alias: 'F30',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] F28[ξ]∩S3',
          term: 'двоюродные сёстры',
          definitionText: 'Двоюродные сиблинги данного человека, являющиеся женщинами'
        }
      },
      {
        draft: {
          id: 57,
          alias: 'D12',
          cstType: CstType.TERM,
          definitionFormal: 'S2∆S3',
          term: 'мужчины и женщины',
          definitionText: 'Совокупность мужчин и женщин как симметрическая разность разбиения по полу'
        }
      },
      {
        draft: {
          id: 58,
          alias: 'F36',
          cstType: CstType.FUNCTION,
          definitionFormal: '[ξ∈X1] red({F7[ξ], F8[ξ]})',
          term: 'родители данного человека (через red)',
          definitionText: 'Объединение множеств отца и матери данного человека'
        }
      },
      {
        draft: {
          id: 59,
          alias: 'D13',
          cstType: CstType.TERM,
          definitionFormal: 'Pr2,1(S1)',
          term: 'пары ребёнок — родитель',
          definitionText: 'Все отношения ребёнок — родитель как пары людей'
        }
      },
      {
        draft: {
          id: 64,
          alias: 'A6',
          cstType: CstType.AXIOM,
          definitionFormal: '(S2⊆X1 & S3⊆X1 & S2∩S3=∅) ⇔ S2∪S3=X1',
          term: 'эквивалентность разбиения по полу',
          definitionText: 'Мужчины и женщины образуют разбиение множества людей'
        }
      },
      {
        draft: {
          id: 65,
          alias: 'A7',
          cstType: CstType.AXIOM,
          definitionFormal: '∀ξ∈X1 (ξ∈S2 ∨ ξ∈S3)',
          term: 'каждый человек — мужчина или женщина',
          definitionText: ''
        }
      },
      {
        draft: {
          id: 67,
          alias: 'T1',
          cstType: CstType.STATEMENT,
          definitionFormal: '∀(μ,ν)∈S1 μ∉F2[ν]',
          term: 'родитель не потомок ребёнка',
          definitionText: 'В каждой паре родитель — ребёнок родитель не является потомком ребёнка'
        }
      },
      {
        draft: {
          id: 69,
          alias: 'T2',
          cstType: CstType.STATEMENT,
          definitionFormal: 'S2⊄S3',
          term: 'не все мужчины — женщины',
          definitionText: 'Множество мужчин не содержится в множестве женщин'
        }
      },
      {
        draft: {
          id: 12,
          alias: 'A1',
          cstType: CstType.AXIOM,
          definitionFormal: 'card(X1)≤10',
          term: 'не более десяти человек',
          definitionText: 'В предметной области не более десяти человек'
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
      throw new Error(`${failedAlias}: analysis failed: ${JSON.stringify(diags)}`);
    }

    await client.call('setModelValues', {
      sessionId: session.sessionId,
      set: [...KINSHIP_MODEL_SET]
    });
    await client.call('recalculateModel', { sessionId: session.sessionId });

    await assertCleanDiagnostics(
      client,
      session.sessionId,
      new Map(drafts.map(entry => [entry.draft.id!, entry.draft.alias])),
      'kinship RSForm'
    );

    await client.call('commitStep', {
      sessionId: session.sessionId,
      message:
        'КС «родственные отношения»: браки, пол, сиблинги; ∆ ⊆ ⊂ ⊄ ∨ ⇒ ⇔ bool red Pr1,2 Fi1,2 pr1,2, упакованные кванторы'
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
