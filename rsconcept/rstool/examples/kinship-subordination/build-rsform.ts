/**
 * Synthesis of two microtheories: kinship (parent–child) and subordination,
 * with the synthetic axiom «a direct relative is not in direct subordination».
 * Run from the package root: `pnpm run example:build-kinship-subordination-schema`.
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { type AgentConstituentaPatch, RSToolAgent } from '../../src';

import { describeBrief, formatDiagnostics } from '../diagnostics-utils';
import { SUBORDINATION_ITEMS } from '../subordination/constants';

/** Kinship microtheory reduced to what the synthesis needs. */
const KINSHIP_ITEMS: AgentConstituentaPatch[] = [
  { alias: 'X1', term: 'люди', convention: 'Люди, родство которых рассматривается.' },
  {
    alias: 'S1',
    term: 'родитель–ребёнок',
    definitionFormal: 'ℬ(X1×X1)',
    convention: 'Пара (родитель, ребёнок).'
  },
  {
    alias: 'F1',
    term: 'родители человека',
    definitionFormal: '[ξ∈X1] Pr1(Fi2[{ξ}](S1))',
    definitionText: 'Родители данного человека.'
  },
  {
    alias: 'F2',
    term: 'дети человека',
    definitionFormal: '[ξ∈X1] Pr2(Fi1[{ξ}](S1))',
    definitionText: 'Дети данного человека.'
  },
  {
    alias: 'F3',
    term: 'братья и сёстры',
    definitionFormal: '[ξ∈X1] Pr2(Fi1[F1[ξ]](S1))\\{ξ}',
    definitionText: 'Другие дети родителей данного человека.'
  },
  {
    alias: 'F4',
    term: 'прямые родственники',
    definitionFormal: '[ξ∈X1] F1[ξ]∪F2[ξ]∪F3[ξ]',
    definitionText: 'Родители, дети, братья и сёстры данного человека — родственники 1 ранга (Т1 §1.2.18).'
  }
];

function run() {
  const tool = new RSToolAgent();
  const receiver = tool.createSession({
    alias: 'KSUB',
    title: 'Родство и подчинение',
    comment: describeBrief(resolve(import.meta.dirname, 'brief.json'))
  });
  tool.applySchemaPatch({ items: SUBORDINATION_ITEMS }, receiver.sessionId);
  const source = tool.createSession({ title: 'Родство' });
  tool.applySchemaPatch({ items: KINSHIP_ITEMS }, source.sessionId);

  tool.setCurrentSession(receiver.sessionId);
  const synthesis = tool.synthesize({
    sourceSessionId: source.sessionId,
    // исходное с исходным: люди родства — те же сотрудники (решение DC1)
    substitutions: [{ original: 'X1', substitution: 'X1' }]
  });
  const kin = synthesis.aliasMapping;
  const result = tool.applySchemaPatch({
    commitMessage: 'синтез родства и подчинения',
    items: [
      {
        alias: 'A3',
        term: 'нет прямого подчинения родственнику',
        definitionFormal: `∀(α,β)∈D1 β∉${kin.F4}[α]`,
        definitionText:
          'Прямой родственник (родитель, ребёнок, брат, сестра) не находится с человеком в прямом подчинении (Т1 §1.2.18).'
      },
      {
        alias: 'D11',
        term: 'подчинение родственнику',
        definitionFormal: `D{(α,β)∈D1 | β∈${kin.F4}[α]}`,
        definitionText: 'Пары прямого подчинения, в которых начальник и подчинённый — прямые родственники.'
      },
      {
        alias: 'D12',
        term: 'косвенное подчинение родственнику',
        definitionFormal: `D{(α,β)∈X1×X1 | β∈F3[α] & β∈${kin.F4}[α]}`,
        definitionText: 'Пары людей, где второй — косвенный подчинённый первого и его прямой родственник.'
      }
    ]
  });
  const diagnostics = tool.listDiagnostics();
  if (!result.success || diagnostics.length > 0) {
    throw new Error(formatDiagnostics(diagnostics));
  }
  const path = resolve(import.meta.dirname, 'rsform-session.json');
  writeFileSync(path, tool.exportSession() + '\n', 'utf8');
  console.log(`kinship-subordination: ${JSON.stringify(kin)} → ${path}`);
}

run();
