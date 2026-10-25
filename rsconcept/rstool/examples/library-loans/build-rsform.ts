/**
 * «Выдача книг»: schema from software requirements v1, then change request v2 on top; anti-examples.
 * Run from the package root: `pnpm run example:build-library-loans-schema`.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { type AgentConstituentaPatch, RSToolAgent } from '../../src';

import { describeBrief, formatDiagnostics } from '../diagnostics-utils';

const V1_ITEMS: AgentConstituentaPatch[] = [
  { alias: 'X1', term: 'читатели', convention: 'Записанные читатели библиотеки.' },
  { alias: 'X2', term: 'экземпляры', convention: 'Физические экземпляры книг фонда (ТЗ 1).' },
  {
    alias: 'X3',
    term: 'издания',
    convention: 'Издания: книга в конкретном издании; у издания может быть много экземпляров.'
  },
  {
    alias: 'S1',
    term: 'издание экземпляра',
    definitionFormal: 'ℬ(X2×X3)',
    convention: 'Пара (экземпляр, издание): экземпляр — копия издания (ТЗ 1).'
  },
  {
    alias: 'S2',
    term: 'выдачи',
    definitionFormal: 'ℬ(X1×X2×Z)',
    convention:
      'Тройка (читатель, экземпляр, день выдачи) для экземпляров, которые сейчас на руках (ТЗ 2; решение DC1). Дни — номера дней.'
  },
  {
    alias: 'S3',
    term: 'текущий день',
    definitionFormal: 'Z',
    convention: 'Номер текущего дня в той же нумерации, что и дни выдачи (решение DC3).'
  },
  {
    alias: 'D1',
    term: 'выданные экземпляры',
    definitionFormal: 'Pr2(S2)',
    definitionText: 'Экземпляры, которые сейчас на руках у читателей.'
  },
  {
    alias: 'D2',
    term: 'доступные экземпляры',
    definitionFormal: 'X2\\D1',
    definitionText: 'Экземпляры, которые сейчас не выданы.'
  },
  {
    alias: 'F1',
    term: 'экземпляры издания',
    definitionFormal: '[ε∈X3] Pr1(Fi2[{ε}](S1))',
    definitionText: 'Все экземпляры данного издания.'
  },
  {
    alias: 'F2',
    term: 'доступные экземпляры издания',
    definitionFormal: '[ε∈X3] F1[ε]\\D1',
    definitionText: 'Невыданные экземпляры данного издания.'
  },
  {
    alias: 'D3',
    term: 'доступные издания',
    definitionFormal: 'D{ε∈X3 | F2[ε]≠∅}',
    definitionText: 'Издания, у которых есть хотя бы один доступный экземпляр.'
  },
  {
    alias: 'F3',
    term: 'экземпляры читателя',
    definitionFormal: '[ξ∈X1] Pr2(Fi1[{ξ}](S2))',
    definitionText: 'Экземпляры на руках у данного читателя.'
  },
  {
    alias: 'D4',
    term: 'просроченные выдачи',
    definitionFormal: 'D{σ∈S2 | pr3(σ)+14 < S3}',
    definitionText: 'Выдачи, с которых прошло больше 14 дней (решение DC2).'
  },
  {
    alias: 'D5',
    term: 'читатели с выдачами',
    definitionFormal: 'Pr1(S2)',
    definitionText: 'Читатели, у которых есть экземпляр на руках.'
  },
  {
    alias: 'D6',
    term: 'должники',
    definitionFormal: 'Pr1(D4)',
    definitionText: 'Читатели с хотя бы одной просроченной выдачей.'
  },
  {
    alias: 'A1',
    term: 'экземпляр выдан одному читателю',
    definitionFormal: 'card(Pr2(S2))=card(S2)',
    definitionText: 'Один экземпляр не выдан двум читателям и не записан дважды (ТЗ 3).'
  },
  {
    alias: 'A2',
    term: 'не больше 5 экземпляров на руках',
    definitionFormal: '∀ξ∈X1 card(F3[ξ])≤5',
    definitionText: 'ТЗ 4.'
  },
  {
    alias: 'A3',
    term: 'у экземпляра одно издание',
    definitionFormal: 'card(S1)=card(Pr1(S1)) & Pr1(S1)=X2',
    definitionText: 'Каждый экземпляр — копия ровно одного издания (ТЗ 1).'
  },
  {
    alias: 'A4',
    term: 'выдача не из будущего',
    definitionFormal: '∀σ∈S2 pr3(σ)≤S3',
    definitionText: 'День выдачи не позже текущего дня.'
  }
];

/** Change request v2: renewals and reservations; D4 is redefined by decision DC8. */
const V2_ITEMS: AgentConstituentaPatch[] = [
  {
    alias: 'S4',
    term: 'продления',
    definitionFormal: 'ℬ(X2×Z)',
    convention:
      'Пара (экземпляр, номер продления 1, 2, …) для каждого сделанного продления текущей выдачи (решение DC7).'
  },
  {
    alias: 'F4',
    term: 'число продлений',
    definitionFormal: '[ε∈X2] card(Fi1[{ε}](S4))',
    definitionText: 'Сколько раз продлена выдача данного экземпляра.'
  },
  {
    alias: 'D4',
    definitionFormal: 'D{σ∈S2 | pr3(σ) + 14 * (1 + F4[pr2(σ)]) < S3}',
    definitionText: 'Выдачи, у которых истёк срок: 14 дней плюс по 14 дней за каждое продление (решение DC8).'
  },
  {
    alias: 'S5',
    term: 'брони',
    definitionFormal: 'ℬ(X1×X3)',
    convention: 'Пара (читатель, издание): читатель забронировал издание (v2 п. 2; решение DC9).'
  },
  {
    alias: 'D7',
    term: 'забронированные издания',
    definitionFormal: 'Pr2(S5)',
    definitionText: 'Издания, на которые есть бронь.'
  },
  {
    alias: 'A5',
    term: 'не больше двух продлений',
    definitionFormal: '∀ε∈X2 F4[ε]≤2',
    definitionText: 'v2 п. 1.'
  },
  {
    alias: 'A6',
    term: 'продлевается только выданное',
    definitionFormal: 'Pr1(S4)⊆D1',
    definitionText: 'Продления есть только у экземпляров на руках.'
  },
  {
    alias: 'A7',
    term: 'бронь только недоступного издания',
    definitionFormal: '∀ρ∈S5 F2[pr2(ρ)]=∅',
    definitionText: 'Бронируют издание, у которого нет доступных экземпляров (v2 п. 2).'
  }
];

function replaceItem(items: AgentConstituentaPatch[], alias: string, patch: Partial<AgentConstituentaPatch>) {
  return items.map(item => (item.alias === alias ? { ...item, ...patch } : item));
}

/** «Green but wrong» variants of v1 (see NOTES.md). */
const ANTI_EXAMPLES: Record<string, AgentConstituentaPatch[]> = {
  'uncovered': V1_ITEMS.filter(item => !['D2', 'F2', 'D3'].includes(item.alias)),
  'weakened': [
    ...V1_ITEMS.filter(item => !['A1', 'D4', 'D6'].includes(item.alias)),
    {
      alias: 'S4',
      term: 'просроченные выдачи',
      definitionFormal: 'ℬ(X1×X2×Z)',
      convention: 'Просроченные выдачи, их отмечает библиотекарь.'
    },
    { alias: 'D6', term: 'должники', definitionFormal: 'Pr1(S4)', definitionText: 'Читатели с просроченной выдачей.' }
  ],
  'species-as-genus': [
    ...V1_ITEMS.filter(item => !['S2', 'D1', 'F3', 'D4', 'D5', 'D6', 'A1', 'A2', 'A4'].includes(item.alias)),
    {
      alias: 'S2',
      term: 'читатель экземпляра',
      definitionFormal: 'ℬ(X2×X1)',
      convention: 'Пара (экземпляр, читатель): у кого экземпляр сейчас.'
    },
    { alias: 'D1', term: 'выданные экземпляры', definitionFormal: 'Pr1(S2)' },
    { alias: 'D5', term: 'читатели с выдачами', definitionFormal: 'Pr2(S2)' }
  ],
  'collapsed': replaceItem(V1_ITEMS, 'D6', { definitionFormal: 'D5' })
};

function buildSession(title: string, items: AgentConstituentaPatch[]): string {
  const tool = new RSToolAgent();
  tool.createSession({ alias: 'LIB', title, comment: describeBrief(resolve(import.meta.dirname, 'brief-v1.json')) });
  const result = tool.applySchemaPatch({ items, commitMessage: title });
  const diagnostics = tool.listDiagnostics();
  if (!result.success || diagnostics.length > 0) {
    throw new Error(`${title}: ${formatDiagnostics(diagnostics)}`);
  }
  return tool.exportSession() + '\n';
}

function buildV2(): string {
  const tool = new RSToolAgent();
  tool.createSession({
    alias: 'LIB',
    title: 'Выдача книг',
    comment: describeBrief(resolve(import.meta.dirname, 'brief.json'))
  });
  tool.applySchemaPatch({ items: V1_ITEMS, commitMessage: 'v1' });
  const result = tool.applySchemaPatch({ items: V2_ITEMS, commitMessage: 'v2: продления и брони' });
  const diagnostics = tool.listDiagnostics();
  if (!result.success || diagnostics.length > 0) {
    throw new Error(`v2: ${formatDiagnostics(diagnostics)}`);
  }
  return tool.exportSession() + '\n';
}

function run() {
  const root = import.meta.dirname;
  writeFileSync(resolve(root, 'rsform-session-v1.json'), buildSession('Выдача книг', V1_ITEMS));
  writeFileSync(resolve(root, 'rsform-session.json'), buildV2());
  mkdirSync(resolve(root, 'anti'), { recursive: true });
  for (const [name, items] of Object.entries(ANTI_EXAMPLES)) {
    writeFileSync(resolve(root, 'anti', `${name}.json`), buildSession(`Антипример: ${name}`, items));
  }
  console.log(`library-loans: v1, v2 + ${Object.keys(ANTI_EXAMPLES).length} anti-examples`);
}

run();
