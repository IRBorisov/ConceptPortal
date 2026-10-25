/**
 * «Ролевой доступ»: RBAC with role hierarchy and separation of duties (v1), temporary roles (v2); anti-examples.
 * Run from the package root: `pnpm run example:build-access-control-schema`.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { type AgentConstituentaPatch, RSToolAgent } from '../../src';

import { describeBrief, formatDiagnostics } from '../diagnostics-utils';

const V1_ITEMS: AgentConstituentaPatch[] = [
  { alias: 'X1', term: 'пользователи', convention: 'Учётные записи пользователей системы.' },
  { alias: 'X2', term: 'роли', convention: 'Роли доступа (администратор, редактор, …).' },
  { alias: 'X3', term: 'права', convention: 'Элементарные права: действие над видом ресурса (чтение документов, …).' },
  {
    alias: 'S1',
    term: 'назначения ролей',
    definitionFormal: 'ℬ(X1×X2)',
    convention: 'Пара (пользователь, роль): роль назначена пользователю напрямую.'
  },
  {
    alias: 'S2',
    term: 'права роли',
    definitionFormal: 'ℬ(X2×X3)',
    convention: 'Пара (роль, право): право дано роли напрямую.'
  },
  {
    alias: 'S3',
    term: 'иерархия ролей',
    definitionFormal: 'ℬ(X2×X2)',
    convention: 'Пара (старшая, младшая): старшая роль включает права младшей.'
  },
  {
    alias: 'S4',
    term: 'несовместимые роли',
    definitionFormal: 'ℬ(X2×X2)',
    convention: 'Пара ролей, которые нельзя иметь одному пользователю (разделение обязанностей).'
  },
  {
    alias: 'F1',
    term: 'младшие роли',
    definitionFormal: '[ρ∈X2] R{σ:=Pr2(Fi1[{ρ}](S3)) | σ∪Pr2(Fi1[σ](S3))}',
    definitionText: 'Роли, которые данная роль включает напрямую или через цепочку.'
  },
  {
    alias: 'F2',
    term: 'прямые роли',
    definitionFormal: '[ξ∈X1] Pr2(Fi1[{ξ}](S1))',
    definitionText: 'Роли, назначенные пользователю напрямую.'
  },
  {
    alias: 'F3',
    term: 'унаследованные роли',
    definitionFormal: '[ξ∈X1] red(I{F1[ρ] | ρ:∈F2[ξ]})\\F2[ξ]',
    definitionText: 'Роли, которые пользователь получает только через иерархию.'
  },
  {
    alias: 'F4',
    term: 'эффективные роли',
    definitionFormal: '[ξ∈X1] F2[ξ]∪F3[ξ]',
    definitionText: 'Прямые и унаследованные роли пользователя.'
  },
  {
    alias: 'F5',
    term: 'назначенные права',
    definitionFormal: '[ξ∈X1] Pr2(Fi1[F2[ξ]](S2))',
    definitionText: 'Права прямых ролей пользователя.'
  },
  {
    alias: 'F6',
    term: 'эффективные права',
    definitionFormal: '[ξ∈X1] Pr2(Fi1[F4[ξ]](S2))',
    definitionText: 'Права всех ролей пользователя, включая унаследованные.'
  },
  {
    alias: 'A1',
    term: 'иерархия без циклов',
    definitionFormal: '∀ρ∈X2 ρ∉F1[ρ]',
    definitionText: 'Роль не включает саму себя ни напрямую, ни через цепочку.'
  },
  {
    alias: 'A2',
    term: 'разделение обязанностей',
    definitionFormal: '∀ξ∈X1 ∀(α,β)∈S4 ¬(α∈F4[ξ] & β∈F4[ξ])',
    definitionText: 'Ни у одного пользователя нет обеих ролей несовместимой пары, в том числе через иерархию.'
  }
];

/** Change request v2: temporary role assignments; F2 is redefined by decision DC6. */
const V2_ITEMS: AgentConstituentaPatch[] = [
  {
    alias: 'S5',
    term: 'временные назначения',
    definitionFormal: 'ℬ(X1×X2×Z×Z)',
    convention: 'Четвёрка (пользователь, роль, первый день, последний день): роль действует в эти дни включительно.'
  },
  {
    alias: 'S6',
    term: 'текущий день',
    definitionFormal: 'Z',
    convention: 'Номер текущего дня в той же нумерации, что и периоды назначений.'
  },
  {
    alias: 'F2',
    definitionFormal: '[ξ∈X1] Pr2(Fi1[{ξ}](S1)) ∪ I{pr2(τ) | τ:∈Fi1[{ξ}](S5); pr3(τ)≤S6; S6≤pr4(τ)}',
    definitionText: 'Роли, назначенные пользователю напрямую: постоянно или временно с действующим сегодня периодом.'
  },
  {
    alias: 'A3',
    term: 'период назначения корректен',
    definitionFormal: '∀τ∈S5 pr3(τ)≤pr4(τ)',
    definitionText: 'Первый день периода не позже последнего.'
  }
];

const ANTI_EXAMPLES: Record<string, AgentConstituentaPatch[]> = {
  weakened: V1_ITEMS.map(item =>
    item.alias === 'A2' ? { ...item, definitionFormal: '∀ξ∈X1 ∀(α,β)∈S4 ¬(α∈F2[ξ] & β∈F2[ξ])' } : item
  ),
  collapsed: V1_ITEMS.map(item => (item.alias === 'F6' ? { ...item, definitionFormal: '[ξ∈X1] F5[ξ]' } : item))
};

function build(title: string, brief: string, ...batches: AgentConstituentaPatch[][]): string {
  const tool = new RSToolAgent();
  tool.createSession({ alias: 'RBAC', title, comment: describeBrief(resolve(import.meta.dirname, brief)) });
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
  writeFileSync(resolve(root, 'rsform-session-v1.json'), build('Ролевой доступ', 'brief-v1.json', V1_ITEMS));
  writeFileSync(resolve(root, 'rsform-session.json'), build('Ролевой доступ', 'brief.json', V1_ITEMS, V2_ITEMS));
  mkdirSync(resolve(root, 'anti'), { recursive: true });
  for (const [name, items] of Object.entries(ANTI_EXAMPLES)) {
    writeFileSync(resolve(root, 'anti', `${name}.json`), build(`Антипример: ${name}`, 'brief-v1.json', items));
  }
  console.log(`access-control: v1, v2 + ${Object.keys(ANTI_EXAMPLES).length} anti-examples`);
}

run();
