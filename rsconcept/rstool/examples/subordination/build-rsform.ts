/**
 * Teaching microtheory «Начальники и подчинённые»: reference schema and anti-examples.
 * Run from the package root: `pnpm run example:build-subordination-schema`.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { type AgentConstituentaPatch, RSToolAgent } from '../../src';

import { formatDiagnostics } from '../diagnostics-utils';

import { SUBORDINATION_ITEMS } from './constants';

/** «Green but wrong» variants: each is caught by a specific brief check (see NOTES.md). */
const ANTI_EXAMPLES: Record<string, AgentConstituentaPatch[]> = {
  'two-sets': [
    { alias: 'X1', term: 'начальники', convention: 'Сотрудники, которые руководят другими.' },
    { alias: 'X2', term: 'подчинённые', convention: 'Сотрудники, у которых есть руководитель.' },
    {
      alias: 'S1',
      term: 'подчинение',
      definitionFormal: 'ℬ(X1×X2)',
      convention: 'Пара (начальник, подчинённый).'
    },
    { alias: 'D1', term: 'руководящие начальники', definitionFormal: 'Pr1(S1)' },
    { alias: 'D2', term: 'подчинённые с начальником', definitionFormal: 'Pr2(S1)' }
  ],
  'weakened': SUBORDINATION_ITEMS.map(item =>
    item.alias === 'A1' ? { ...item, term: 'никто не начальник себе', definitionFormal: '∀ξ∈X1 (ξ,ξ)∉S1' } : item
  ),
  'collapsed': SUBORDINATION_ITEMS.map(item => (item.alias === 'D5' ? { ...item, definitionFormal: 'D1' } : item)),
  'species-as-genus': [
    ...SUBORDINATION_ITEMS,
    {
      alias: 'A2',
      term: 'один непосредственный начальник',
      definitionFormal: 'card(S1)=card(Pr2(S1))',
      definitionText: 'У каждого подчинённого ровно один непосредственный начальник.'
    }
  ]
};

function buildSession(title: string, items: AgentConstituentaPatch[]): string {
  const tool = new RSToolAgent();
  tool.createSession({ alias: 'SUB', title });
  const result = tool.applySchemaPatch({ items, commitMessage: title });
  const diagnostics = tool.listDiagnostics();
  if (!result.success || diagnostics.length > 0) {
    throw new Error(`${title}: ${formatDiagnostics(diagnostics)}`);
  }
  return tool.exportSession() + '\n';
}

function run() {
  const root = import.meta.dirname;
  writeFileSync(resolve(root, 'rsform-session.json'), buildSession('Начальники и подчинённые', SUBORDINATION_ITEMS));
  mkdirSync(resolve(root, 'anti'), { recursive: true });
  for (const [name, items] of Object.entries(ANTI_EXAMPLES)) {
    writeFileSync(resolve(root, 'anti', `${name}.json`), buildSession(`Антипример: ${name}`, items));
  }
  console.log(`subordination: rsform-session.json + ${Object.keys(ANTI_EXAMPLES).length} anti-examples`);
}

run();
