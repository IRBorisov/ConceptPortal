/**
 * Teaching microtheory «Начальники и подчинённые»: reference schema and anti-examples.
 * Run from the package root: `pnpm run example:build-subordination-schema`.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { type AgentConstituentaPatch, RSToolAgent } from '../../src';

import { describeBrief, formatDiagnostics } from '../diagnostics-utils';

import { SUBORDINATION_ITEMS } from './constants';

/** «Green but wrong» variants: each is caught by a specific brief check (see NOTES.md). */
const ANTI_EXAMPLES: Record<string, AgentConstituentaPatch[]> = {
  // the first hypothesis of Т2 §4.2.1.5: a single person-to-person relation
  'single-relation': [
    { alias: 'X1', term: 'люди', convention: 'Субъекты формальной структуры подчинения.' },
    {
      alias: 'S1',
      term: 'подчинение',
      definitionFormal: 'ℬ(X1×X1)',
      convention: 'Пара (начальник, подчинённый).'
    },
    { alias: 'F1', term: 'прямые подчинённые', definitionFormal: '[ξ∈X1] Pr2(Fi1[{ξ}](S1))' },
    { alias: 'A1', term: 'сам себе не начальник', definitionFormal: '∀ξ∈X1 (ξ,ξ)∉S1' }
  ],
  'weakened': SUBORDINATION_ITEMS.filter(item => item.alias !== 'A1'),
  'collapsed': SUBORDINATION_ITEMS.map(item => (item.alias === 'D8' ? { ...item, definitionFormal: 'D6' } : item)),
  'transitive': [
    ...SUBORDINATION_ITEMS,
    {
      alias: 'A3',
      term: 'подчинённый подчинённого — мой подчинённый',
      definitionFormal: '∀ξ∈X1 F2[ξ]⊆F1[ξ]∪{ξ}',
      definitionText: 'Подчинение транзитивно.'
    }
  ]
};

function buildSession(title: string, items: AgentConstituentaPatch[]): string {
  const tool = new RSToolAgent();
  tool.createSession({ alias: 'SUB', title, comment: describeBrief(resolve(import.meta.dirname, 'brief.json')) });
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
  rmSync(resolve(root, 'anti'), { recursive: true, force: true });
  mkdirSync(resolve(root, 'anti'), { recursive: true });
  for (const [name, items] of Object.entries(ANTI_EXAMPLES)) {
    writeFileSync(resolve(root, 'anti', `${name}.json`), buildSession(`Антипример: ${name}`, items));
  }
  console.log(`subordination: rsform-session.json + ${Object.keys(ANTI_EXAMPLES).length} anti-examples`);
}

run();
