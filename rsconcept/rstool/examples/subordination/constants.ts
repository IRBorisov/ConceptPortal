/** Reference schema of the teaching microtheory «Начальники и подчинённые» (see NOTES.md). */
import { type AgentConstituentaPatch } from '../../src';

export const SUBORDINATION_ITEMS: AgentConstituentaPatch[] = [
  {
    alias: 'X1',
    term: 'сотрудники',
    convention: 'Сотрудники организации в рассматриваемый момент времени (решение DC1).'
  },
  {
    alias: 'S1',
    term: 'непосредственное подчинение',
    definitionFormal: 'ℬ(X1×X1)',
    convention:
      'Пара (начальник, подчинённый): первый — непосредственный руководитель второго. Косвенное подчинение сюда не входит (решения DC2, DC6).'
  },
  {
    alias: 'D1',
    term: 'начальники',
    definitionFormal: 'Pr1(S1)',
    definitionText: 'Сотрудники, у которых есть хотя бы один непосредственный подчинённый.'
  },
  {
    alias: 'D2',
    term: 'подчинённые',
    definitionFormal: 'Pr2(S1)',
    definitionText: 'Сотрудники, у которых есть хотя бы один непосредственный начальник.'
  },
  {
    alias: 'D3',
    term: 'высшие руководители',
    definitionFormal: 'X1\\D2',
    definitionText: 'Сотрудники без начальника.'
  },
  {
    alias: 'D4',
    term: 'рядовые сотрудники',
    definitionFormal: 'X1\\D1',
    definitionText: 'Сотрудники без подчинённых.'
  },
  {
    alias: 'D5',
    term: 'руководители среднего звена',
    definitionFormal: 'D1∩D2',
    definitionText: 'Начальники, которые сами являются подчинёнными.'
  },
  {
    alias: 'F1',
    term: 'непосредственные подчинённые',
    definitionFormal: '[ξ∈X1] Pr2(Fi1[{ξ}](S1))',
    definitionText: 'Сотрудники, непосредственным начальником которых является данный сотрудник.'
  },
  {
    alias: 'F2',
    term: 'непосредственные начальники',
    definitionFormal: '[ξ∈X1] Pr1(Fi2[{ξ}](S1))',
    definitionText: 'Непосредственные руководители данного сотрудника.'
  },
  {
    alias: 'F3',
    term: 'все подчинённые',
    definitionFormal: '[ξ∈X1] R{σ:=F1[ξ] | σ∪Pr2(Fi1[σ](S1))}',
    definitionText: 'Непосредственные подчинённые данного сотрудника и все их подчинённые.'
  },
  {
    alias: 'F4',
    term: 'коллеги',
    definitionFormal: '[ξ∈X1] Pr2(Fi1[F2[ξ]](S1))\\{ξ}',
    definitionText: 'Другие сотрудники, у которых есть общий с данным сотрудником непосредственный начальник.'
  },
  {
    alias: 'F5',
    term: 'косвенные подчинённые',
    definitionFormal: '[ξ∈X1] F3[ξ]\\F1[ξ]',
    definitionText: 'Подчинённые данного сотрудника, которые не являются его непосредственными подчинёнными.'
  },
  {
    alias: 'D6',
    term: 'сотрудники в двойном подчинении',
    definitionFormal: 'D{ξ∈X1 | card(F2[ξ]) ≥ 2}',
    definitionText: 'Сотрудники, у которых не меньше двух непосредственных начальников.'
  },
  {
    alias: 'A1',
    term: 'нет циклов подчинения',
    definitionFormal: '∀ξ∈X1 ξ∉F3[ξ]',
    definitionText: 'Никто не оказывается в подчинении у самого себя, в том числе через цепочку подчинённых.'
  },
  {
    alias: 'T1',
    term: 'существует высший руководитель',
    definitionFormal: 'X1≠∅ ⇒ D3≠∅',
    definitionText: 'Если в организации есть сотрудники, среди них есть хотя бы один высший руководитель.'
  }
];
