import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { CstType, RSToolWrapperClient, type AddOrUpdateConstituentaInput } from '../../src';

import { DEFAULT_RSFORM_SESSION_PATH } from './constants';

/**
 * Учебная RSForm «шоколадный Ним» (ОШК-НИМ) по Portal rsforms/825.
 * Целочисленное представление без базисного множества: размеры и позиции — кортежи Z×Z.
 */
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
          alias: 'S1',
          cstType: CstType.STRUCTURED,
          definitionFormal: 'Z×Z',
          term: 'шоколадка',
          convention: 'Первая проекция — ширина, вторая — длина'
        }
      },
      {
        draft: {
          id: 2,
          alias: 'D1',
          cstType: CstType.TERM,
          definitionFormal: 'pr1(S1)',
          term: 'ширина шоколадки'
        }
      },
      {
        draft: {
          id: 3,
          alias: 'D2',
          cstType: CstType.TERM,
          definitionFormal: 'pr2(S1)',
          term: 'длина шоколадки'
        }
      },
      {
        draft: {
          id: 4,
          alias: 'S2',
          cstType: CstType.STRUCTURED,
          definitionFormal: 'Z×Z',
          term: 'отравленная долька',
          convention: 'Координаты отравленной дольки: первая проекция по ширине, вторая — по длине'
        }
      },
      {
        draft: {
          id: 5,
          alias: 'D3',
          cstType: CstType.TERM,
          definitionFormal: 'pr1(S2)',
          term: 'расположение отравленной дольки по ширине'
        }
      },
      {
        draft: {
          id: 6,
          alias: 'D4',
          cstType: CstType.TERM,
          definitionFormal: 'pr2(S2)',
          term: 'расположение отравленной дольки по длине'
        }
      },
      {
        draft: {
          id: 7,
          alias: 'A1',
          cstType: CstType.AXIOM,
          definitionFormal: '(1≤D3)&(D3≤D1)&(1≤D4)&(D4≤D2)',
          term: 'отравленная долька в шоколадке',
          definitionText: 'Координаты отравленной дольки лежат в пределах шоколадки'
        }
      },
      {
        draft: {
          id: 8,
          alias: 'P1',
          cstType: CstType.PREDICATE,
          definitionFormal: '[α∈Z] R{ξ:=α | ξ≥2 | ξ-2}=0',
          term: 'чётное?',
          convention: 'Для малых аргументов — прямое вычитание двойки; для больших нужно двоичное представление'
        }
      },
      {
        draft: {
          id: 9,
          alias: 'F1',
          cstType: CstType.FUNCTION,
          definitionFormal: '[α∈Z, σ∈ℬ(Z×R1)] debool(Pr2(Fi1[{α}](σ)))',
          term: 'значение элемента последовательности с данным номером',
          definitionText: 'Значение пары с заданным номером в последовательности пар'
        }
      },
      {
        draft: {
          id: 10,
          alias: 'F2',
          cstType: CstType.FUNCTION,
          definitionFormal: '[σ∈ℬ(Z)] debool(D{ξ∈σ | ∀α∈σ α≤ξ})',
          term: 'максимум набора чисел'
        }
      },
      {
        draft: {
          id: 11,
          alias: 'F4',
          cstType: CstType.FUNCTION,
          definitionFormal: '[σ∈ℬ(Z)] D{ξ∈σ | ∀α∈σ α≤ξ}',
          term: 'верхние границы набора чисел',
          definitionText: 'Множество элементов набора, не меньших всех остальных'
        }
      },
      {
        draft: {
          id: 12,
          alias: 'F5',
          cstType: CstType.FUNCTION,
          definitionFormal: '[α∈Z, β∈Z] debool(I{(α,0) | α<β} ∪ I{(α-β,1) | α≥β})',
          term: 'деление с остатком на степень двойки',
          convention: 'Предполагается, что удвоенный делитель больше делимого'
        }
      },
      {
        draft: {
          id: 13,
          alias: 'F6',
          cstType: CstType.FUNCTION,
          definitionFormal: '[α∈Z, β∈Z] pr1(F5[α, β])',
          term: 'остаток'
        }
      },
      {
        draft: {
          id: 14,
          alias: 'F7',
          cstType: CstType.FUNCTION,
          definitionFormal: '[α∈Z, β∈Z] pr2(F5[α, β])',
          term: 'целая часть'
        }
      },
      {
        draft: {
          id: 15,
          alias: 'D5',
          cstType: CstType.TERM,
          definitionFormal: '{(0, D3-1), (1, D4-1), (2, D1-D3), (3, D2-D4)}',
          term: 'шоколадка как кучки Ним',
          definitionText: 'Четыре кучки камней после разреза по отравленной дольке: слева, сверху, справа и снизу'
        }
      },
      {
        draft: {
          id: 16,
          alias: 'D6',
          cstType: CstType.TERM,
          definitionFormal: 'card(D5)',
          term: 'количество кучек'
        }
      },
      {
        draft: {
          id: 17,
          alias: 'D7',
          cstType: CstType.TERM,
          definitionFormal: 'Pr1(D5)',
          term: 'номера кучек'
        }
      },
      {
        draft: {
          id: 18,
          alias: 'D8',
          cstType: CstType.TERM,
          definitionFormal: 'Pr2(D5)',
          term: 'размеры кучек'
        }
      },
      {
        draft: {
          id: 19,
          alias: 'A2',
          cstType: CstType.AXIOM,
          definitionFormal: 'card(D5)=card(D7)',
          term: 'однозначность количества камней в кучках',
          definitionText: 'У каждой кучки ровно один номер'
        }
      },
      {
        draft: {
          id: 20,
          alias: 'A3',
          cstType: CstType.AXIOM,
          definitionFormal: '∀α∈D5 (pr1(α)<D6 & pr1(α)≥0)',
          term: 'последовательная нумерация кучек',
          definitionText: 'Номера кучек — целые от нуля до количества кучек минус один'
        }
      },
      {
        draft: {
          id: 21,
          alias: 'F8',
          cstType: CstType.FUNCTION,
          definitionFormal: '[α∈Z] F1[α,D5]',
          term: 'количество камней в данной кучке'
        }
      },
      {
        draft: {
          id: 22,
          alias: 'D9',
          cstType: CstType.TERM,
          definitionFormal: 'Pr1(Fi2[{0}](D5))',
          term: 'пустые кучки',
          definitionText: 'Номера кучек с нулевым размером'
        }
      },
      {
        draft: {
          id: 23,
          alias: 'D10',
          cstType: CstType.TERM,
          definitionFormal: 'D7\\D9',
          term: 'непустые кучки',
          definitionText: 'Номера кучек с положительным размером'
        }
      },
      {
        draft: {
          id: 24,
          alias: 'T1',
          cstType: CstType.STATEMENT,
          definitionFormal: 'D8={0}',
          term: 'игра закончена',
          definitionText: 'Во всех кучках не осталось камней'
        }
      },
      {
        draft: {
          id: 25,
          alias: 'T2',
          cstType: CstType.STATEMENT,
          definitionFormal: 'card(D10)=1',
          term: 'существует выигрышный ход',
          definitionText: 'Осталась ровно одна непустая кучка'
        }
      },
      {
        draft: {
          id: 26,
          alias: 'F10',
          cstType: CstType.FUNCTION,
          definitionFormal: '[σ∈D7×Z] debool(I{ pr2(σ)*D2 | P1[pr1(σ)]} ∪ I{ pr2(σ)*D1 | ¬P1[pr1(σ)]})',
          term: 'оценка хода Ним',
          definitionText:
            'Стоимость хода в дольках шоколадки: для чётного номера кучки — размер, умноженный на длину, иначе — на ширину'
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
        throw new Error(`${input.draft.alias}: analysis failed (${diagCount} diagnostics)`);
      }
    }

    await client.call('commitStep', {
      sessionId: session.sessionId,
      message: 'КС «шоколадный Ним» (rsforms/825): Z×Z, pr, P#, T#, арифметика, радикал R1'
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
