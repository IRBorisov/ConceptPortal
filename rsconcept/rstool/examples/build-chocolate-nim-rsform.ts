import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { CstType, RSToolWrapperClient, type AgentConstituentaPatch, type ApplySchemaPatchResult } from '../src';

import { DEFAULT_RSFORM_SESSION_PATH } from './chocolate-nim/constants';

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

    const items: AgentConstituentaPatch[] = [
      {
        id: 1,
        alias: 'S1',
        cstType: CstType.STRUCTURED,
        definitionFormal: 'Z×Z',
        term: 'шоколадка',
        convention: 'Первая проекция — ширина, вторая — длина'
      },
      {
        id: 2,
        alias: 'D1',
        cstType: CstType.TERM,
        definitionFormal: 'pr1(S1)',
        term: 'ширина шоколадки'
      },
      {
        id: 3,
        alias: 'D2',
        cstType: CstType.TERM,
        definitionFormal: 'pr2(S1)',
        term: 'длина шоколадки'
      },
      {
        id: 4,
        alias: 'S2',
        cstType: CstType.STRUCTURED,
        definitionFormal: 'Z×Z',
        term: 'отравленная долька',
        convention: 'Координаты отравленной дольки: первая проекция по ширине, вторая — по длине'
      },
      {
        id: 5,
        alias: 'D3',
        cstType: CstType.TERM,
        definitionFormal: 'pr1(S2)',
        term: 'расположение отравленной дольки по ширине'
      },
      {
        id: 6,
        alias: 'D4',
        cstType: CstType.TERM,
        definitionFormal: 'pr2(S2)',
        term: 'расположение отравленной дольки по длине'
      },
      {
        id: 7,
        alias: 'A1',
        cstType: CstType.AXIOM,
        definitionFormal: '(1≤D3)&(D3≤D1)&(1≤D4)&(D4≤D2)',
        term: 'отравленная долька в шоколадке',
        definitionText: 'Координаты отравленной дольки лежат в пределах шоколадки'
      },
      {
        id: 8,
        alias: 'P1',
        cstType: CstType.PREDICATE,
        definitionFormal: '[α∈Z] R{ξ:=α | ξ≥2 | ξ-2}=0',
        term: 'чётное?',
        convention: 'Для малых аргументов — прямое вычитание двойки; для больших нужно двоичное представление'
      },
      {
        id: 9,
        alias: 'F1',
        cstType: CstType.FUNCTION,
        definitionFormal: '[α∈Z, σ∈ℬ(Z×R1)] debool(Pr2(Fi1[{α}](σ)))',
        term: 'значение элемента последовательности с данным номером',
        definitionText: 'Значение пары с заданным номером в последовательности пар'
      },
      {
        id: 10,
        alias: 'F2',
        cstType: CstType.FUNCTION,
        definitionFormal: '[σ∈ℬ(Z)] debool(D{ξ∈σ | ∀α∈σ α≤ξ})',
        term: 'максимум набора чисел'
      },
      {
        id: 11,
        alias: 'F4',
        cstType: CstType.FUNCTION,
        definitionFormal: '[σ∈ℬ(Z)] D{ξ∈σ | ∀α∈σ α≤ξ}',
        term: 'верхние границы набора чисел',
        definitionText: 'Множество элементов набора, не меньших всех остальных'
      },
      {
        id: 12,
        alias: 'F5',
        cstType: CstType.FUNCTION,
        definitionFormal: '[α∈Z, β∈Z] debool(I{(α,0) | α<β} ∪ I{(α-β,1) | α≥β})',
        term: 'деление с остатком на степень двойки',
        convention: 'Предполагается, что удвоенный делитель больше делимого'
      },
      {
        id: 13,
        alias: 'F6',
        cstType: CstType.FUNCTION,
        definitionFormal: '[α∈Z, β∈Z] pr1(F5[α, β])',
        term: 'остаток'
      },
      {
        id: 14,
        alias: 'F7',
        cstType: CstType.FUNCTION,
        definitionFormal: '[α∈Z, β∈Z] pr2(F5[α, β])',
        term: 'целая часть'
      },
      {
        id: 15,
        alias: 'D5',
        cstType: CstType.TERM,
        definitionFormal: '{(0, D3-1), (1, D4-1), (2, D1-D3), (3, D2-D4)}',
        term: 'шоколадка как кучки Ним',
        definitionText: 'Четыре кучки камней после разреза по отравленной дольке: слева, сверху, справа и снизу'
      },
      {
        id: 16,
        alias: 'D6',
        cstType: CstType.TERM,
        definitionFormal: 'card(D5)',
        term: 'количество кучек'
      },
      {
        id: 17,
        alias: 'D7',
        cstType: CstType.TERM,
        definitionFormal: 'Pr1(D5)',
        term: 'номера кучек'
      },
      {
        id: 18,
        alias: 'D8',
        cstType: CstType.TERM,
        definitionFormal: 'Pr2(D5)',
        term: 'размеры кучек'
      },
      {
        id: 19,
        alias: 'A2',
        cstType: CstType.AXIOM,
        definitionFormal: 'card(D5)=card(D7)',
        term: 'однозначность количества камней в кучках',
        definitionText: 'У каждой кучки ровно один номер'
      },
      {
        id: 20,
        alias: 'A3',
        cstType: CstType.AXIOM,
        definitionFormal: '∀α∈D5 (pr1(α)<D6 & pr1(α)≥0)',
        term: 'последовательная нумерация кучек',
        definitionText: 'Номера кучек — целые от нуля до количества кучек минус один'
      },
      {
        id: 21,
        alias: 'F8',
        cstType: CstType.FUNCTION,
        definitionFormal: '[α∈Z] F1[α,D5]',
        term: 'количество камней в данной кучке'
      },
      {
        id: 22,
        alias: 'D9',
        cstType: CstType.TERM,
        definitionFormal: 'Pr1(Fi2[{0}](D5))',
        term: 'пустые кучки',
        definitionText: 'Номера кучек с нулевым размером'
      },
      {
        id: 23,
        alias: 'D10',
        cstType: CstType.TERM,
        definitionFormal: 'D7\\D9',
        term: 'непустые кучки',
        definitionText: 'Номера кучек с положительным размером'
      },
      {
        id: 24,
        alias: 'T1',
        cstType: CstType.STATEMENT,
        definitionFormal: 'D8={0}',
        term: 'игра закончена',
        definitionText: 'Во всех кучках не осталось камней'
      },
      {
        id: 25,
        alias: 'T2',
        cstType: CstType.STATEMENT,
        definitionFormal: 'card(D10)=1',
        term: 'существует выигрышный ход',
        definitionText: 'Осталась ровно одна непустая кучка'
      },
      {
        id: 26,
        alias: 'F10',
        cstType: CstType.FUNCTION,
        definitionFormal: '[σ∈D7×Z] debool(I{ pr2(σ)*D2 | P1[pr1(σ)]} ∪ I{ pr2(σ)*D1 | ¬P1[pr1(σ)]})',
        term: 'оценка хода Ним',
        definitionText:
          'Стоимость хода в дольках шоколадки: для чётного номера кучки — размер, умноженный на длину, иначе — на ширину'
      }
    ];

    const patch = await client.call<ApplySchemaPatchResult>('applySchemaPatch', {
      sessionId: session.sessionId,
      mode: 'atomic',
      items
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
