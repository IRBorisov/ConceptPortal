/**
 * «Запись к врачу»: doctors' slots, bookings and visits (v1), repeat bookings (v2); anti-examples.
 * Run from the package root: `pnpm run example:build-clinic-booking-schema`.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { type AgentConstituentaPatch, RSToolAgent } from '../../src';

import { formatDiagnostics } from '../diagnostics-utils';

const V1_ITEMS: AgentConstituentaPatch[] = [
  { alias: 'X1', term: 'врачи', convention: 'Врачи клиники.' },
  { alias: 'X2', term: 'специальности', convention: 'Врачебные специальности (терапевт, хирург, …).' },
  { alias: 'X3', term: 'пациенты', convention: 'Пациенты, зарегистрированные в клинике.' },
  {
    alias: 'X4',
    term: 'слоты',
    convention: 'Слоты приёма: отрезок времени конкретного врача в конкретный день (решение DC1).'
  },
  {
    alias: 'S1',
    term: 'специальности врача',
    definitionFormal: 'ℬ(X1×X2)',
    convention: 'Пара (врач, специальность).'
  },
  {
    alias: 'S2',
    term: 'врач слота',
    definitionFormal: 'ℬ(X4×X1)',
    convention: 'Пара (слот, врач): врач ведёт приём в слоте.'
  },
  {
    alias: 'S3',
    term: 'время слота',
    definitionFormal: 'ℬ(X4×Z×Z×Z)',
    convention: 'Четвёрка (слот, день, начало, конец); начало и конец — минуты от начала дня.'
  },
  {
    alias: 'S4',
    term: 'записи',
    definitionFormal: 'ℬ(X3×X4)',
    convention: 'Пара (пациент, слот): пациент записан на слот.'
  },
  {
    alias: 'S5',
    term: 'состоявшиеся приёмы',
    definitionFormal: 'ℬ(X3×X4)',
    convention: 'Пара (пациент, слот): пациент пришёл на приём по записи (решение DC3).'
  },
  {
    alias: 'F1',
    term: 'время',
    definitionFormal: '[σ∈X4] Pr2,3,4(Fi1[{σ}](S3))',
    definitionText: 'День, начало и конец данного слота.'
  },
  {
    alias: 'P1',
    term: 'слоты пересекаются',
    definitionFormal: '[σ∈X4, τ∈X4] σ≠τ & ∃(d1,b1,e1)∈F1[σ] ∃(d2,b2,e2)∈F1[τ] (d1=d2 & b1<e2 & b2<e1)',
    definitionText: 'Два разных слота в один день перекрываются по времени.'
  },
  {
    alias: 'F2',
    term: 'слоты врача',
    definitionFormal: '[δ∈X1] Pr1(Fi2[{δ}](S2))',
    definitionText: 'Слоты, в которых ведёт приём данный врач.'
  },
  { alias: 'D1', term: 'свободные слоты', definitionFormal: 'X4\\Pr2(S4)', definitionText: 'Слоты без записи.' },
  {
    alias: 'F3',
    term: 'слоты записей пациента',
    definitionFormal: '[π∈X3] Pr2(Fi1[{π}](S4))',
    definitionText: 'Слоты, на которые записан данный пациент.'
  },
  {
    alias: 'F4',
    term: 'слоты, доступные пациенту',
    definitionFormal: '[π∈X3] D{σ∈D1 | ∀τ∈F3[π] ¬P1[σ,τ]}',
    definitionText: 'Свободные слоты, которые не пересекаются с другими записями пациента.'
  },
  {
    alias: 'A1',
    term: 'одна запись на слот',
    definitionFormal: 'card(Pr2(S4))=card(S4)',
    definitionText: 'п. 3.'
  },
  {
    alias: 'A2',
    term: 'слоты врача не пересекаются',
    definitionFormal: '∀δ∈X1 ∀σ,τ∈F2[δ] ¬P1[σ,τ]',
    definitionText: 'п. 2.'
  },
  {
    alias: 'A3',
    term: 'у слота один врач и одно время',
    definitionFormal: 'card(S2)=card(Pr1(S2)) & Pr1(S2)=X4 & card(S3)=card(Pr1(S3)) & Pr1(S3)=X4',
    definitionText: 'Каждый слот принадлежит ровно одному врачу и имеет ровно одно время.'
  },
  {
    alias: 'A4',
    term: 'начало раньше конца',
    definitionFormal: '∀σ∈S3 pr3(σ)<pr4(σ)',
    definitionText: 'У слота положительная длительность.'
  },
  { alias: 'A5', term: 'приём только по записи', definitionFormal: 'S5⊆S4', definitionText: 'п. 5.' },
  {
    alias: 'F6',
    term: 'специальности данного врача',
    definitionFormal: '[δ∈X1] Pr2(Fi1[{δ}](S1))',
    definitionText: 'Специальности, по которым ведёт приём данный врач.'
  },
  {
    alias: 'A7',
    term: 'у врача есть специальность',
    definitionFormal: '∀δ∈X1 F6[δ]≠∅',
    definitionText: 'п. 1: у врача одна или несколько специальностей.'
  }
];

const V2_ITEMS: AgentConstituentaPatch[] = [
  {
    alias: 'S6',
    term: 'повторные записи',
    definitionFormal: 'ℬ(X3×X4)',
    convention: 'Пара (пациент, слот): запись отмечена как повторная (решение DC5). Остальные записи — первичные.'
  },
  {
    alias: 'F5',
    term: 'врачи, у которых пациент был',
    definitionFormal: '[π∈X3] Pr2(Fi1[Pr2(Fi1[{π}](S5))](S2))',
    definitionText: 'Врачи слотов состоявшихся приёмов данного пациента.'
  },
  {
    alias: 'A6',
    term: 'повторная запись — к знакомому врачу',
    definitionFormal: 'S6⊆S4 & ∀(π,σ)∈S6 Pr2(Fi1[{σ}](S2))⊆F5[π]',
    definitionText: 'Повторная запись — это запись, и её врач уже принимал пациента (v2 п. 1).'
  }
];

const ANTI_EXAMPLES: Record<string, AgentConstituentaPatch[]> = {
  'collapsed': V1_ITEMS.map(item => (item.alias === 'F4' ? { ...item, definitionFormal: '[π∈X3] D1\\F3[π]' } : item)),
  'species-as-genus': V1_ITEMS.filter(item => item.alias !== 'S5' && item.alias !== 'A5')
};

function build(title: string, ...batches: AgentConstituentaPatch[][]): string {
  const tool = new RSToolAgent();
  tool.createSession({ alias: 'CLINIC', title });
  for (const [index, items] of batches.entries()) {
    const result = tool.applySchemaPatch({ items, commitMessage: `${title}: шаг ${index + 1}` });
    if (!result.success) {
      throw new Error(`${title}: ${formatDiagnostics(result.diagnostics)}`);
    }
  }
  const diagnostics = tool.listDiagnostics();
  if (diagnostics.length > 0) {
    throw new Error(`${title}: ${formatDiagnostics(diagnostics)}`);
  }
  return tool.exportSession() + '\n';
}

function run() {
  const root = import.meta.dirname;
  writeFileSync(resolve(root, 'rsform-session-v1.json'), build('Запись к врачу', V1_ITEMS));
  writeFileSync(resolve(root, 'rsform-session.json'), build('Запись к врачу', V1_ITEMS, V2_ITEMS));
  mkdirSync(resolve(root, 'anti'), { recursive: true });
  for (const [name, items] of Object.entries(ANTI_EXAMPLES)) {
    writeFileSync(resolve(root, 'anti', `${name}.json`), build(`Антипример: ${name}`, items));
  }
  console.log(`clinic-booking: v1, v2 + ${Object.keys(ANTI_EXAMPLES).length} anti-examples`);
}

run();
