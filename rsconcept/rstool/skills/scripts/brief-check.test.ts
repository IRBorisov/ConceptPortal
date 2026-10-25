import { describe, expect, it } from 'vitest';

import { RSToolAgent } from '../../src';

import { type Brief, checkBrief } from './brief-check';

function buildSession(overrides: Record<string, { definitionFormal?: string; cstType?: string }> = {}): string {
  const tool = new RSToolAgent();
  tool.createSession({ title: 'Выдачи' });
  const items = [
    { alias: 'X1', term: 'читатели', convention: 'Читатели библиотеки.' },
    { alias: 'X2', term: 'экземпляры', convention: 'Экземпляры книг в фонде.' },
    {
      alias: 'S1',
      term: 'выдачи',
      definitionFormal: 'ℬ(X1×X2×Z)',
      convention: 'Тройка (читатель, экземпляр, срок в днях).'
    },
    { alias: 'D1', term: 'выданные экземпляры', definitionFormal: 'Pr2(S1)' },
    { alias: 'D2', term: 'доступные экземпляры', definitionFormal: 'X2\\D1' },
    { alias: 'F1', term: 'экземпляры читателя', definitionFormal: '[ξ∈X1] Pr2(Fi1[{ξ}](S1))' },
    { alias: 'P1', term: 'должник', definitionFormal: '[ξ∈X1] F1[ξ]≠∅' },
    { alias: 'A1', term: 'экземпляр выдан одному', definitionFormal: 'card(Pr2(S1))=card(S1)' }
  ].map(item => ({ ...item, ...overrides[item.alias] }));
  tool.applySchemaPatch({ items: items as Parameters<RSToolAgent['applySchemaPatch']>[0]['items'] });
  return tool.exportSession();
}

const BRIEF: Brief = {
  version: 1,
  status: 'confirmed',
  approach: 'project',
  object: 'Выдача книг',
  task: 'Проверка выдач',
  expressiveness: [
    { id: 'E1', concept: 'выданный экземпляр', via: 'Pr2 выдач', constituent: 'D1' },
    { id: 'E2', concept: 'доступный экземпляр', via: 'дополнение E1', constituent: 'D2' },
    { id: 'E3', concept: 'экземпляры читателя', via: 'фильтр выдач', constituent: 'F1' }
  ],
  distinctions: [{ id: 'V1', between: ['E1', 'E2'], witness: 'SC1' }],
  invariants: [{ id: 'I1', text: 'Экземпляр не выдан дважды', constituent: 'A1', positive: 'SC1', negative: 'SC2' }],
  decisions: [{ id: 'DC1', topic: 'выдача', choice: 'читатель × экземпляр × срок', rationale: 'срок нужен' }],
  scenarios: [
    {
      id: 'SC1',
      title: 'Обычные выдачи',
      values: {
        X1: ['ann', 'bob'],
        X2: ['e1', 'e2', 'e3'],
        S1: [
          ['ann', 'e1', 3],
          ['bob', 'e2', 5]
        ]
      },
      expect: [
        { of: 'D1', value: ['e1', 'e2'] },
        { of: 'D2', contains: ['e3'], excludes: ['e1'] },
        { of: 'F1', args: ['ann'], value: ['e1'] },
        { of: 'P1', args: ['bob'], holds: true },
        { of: 'A1', holds: true },
        { expr: 'card(D1)', value: 2 }
      ]
    },
    {
      id: 'SC2',
      title: 'Двойная выдача',
      base: 'SC1',
      values: {
        S1: [
          ['ann', 'e1', 3],
          ['bob', 'e1', 4]
        ]
      },
      expect: [{ of: 'A1', holds: false }]
    }
  ]
};

describe('checkBrief', () => {
  it('passes a schema that answers the brief', async () => {
    const { readiness, scenarios } = await checkBrief({ session: buildSession(), brief: BRIEF });
    expect(scenarios.flatMap(item => item.checks.filter(check => !check.passed))).toEqual([]);
    expect(readiness.blockers).toEqual([]);
    expect(readiness.ready).toBe(true);
    expect(readiness.stage).toBe('review');
    expect(readiness.coverage).toEqual({ expressiveness: '3/3', invariants: '1/1', distinctions: '1/1' });
  });

  it('reports a failed expectation with labels', async () => {
    const session = buildSession({ D2: { definitionFormal: 'X2' } });
    const { readiness, scenarios } = await checkBrief({ session, brief: BRIEF });
    const failed = scenarios[0].checks.find(check => !check.passed);
    expect(failed?.target).toBe('D2');
    expect(failed?.actual).toBe('["e1","e2","e3"]');
    expect(readiness.stage).toBe('interpret');
  });

  it('reports uncovered requirements and missing reasoning', async () => {
    const brief: Brief = {
      ...BRIEF,
      status: 'draft',
      expressiveness: [...BRIEF.expressiveness, { id: 'E4', concept: 'просроченная выдача', constituent: null }]
    };
    const { readiness } = await checkBrief({ session: buildSession(), brief });
    expect(readiness.stage).toBe('scope');
    expect(readiness.coverage.expressiveness).toBe('3/4');
    expect(readiness.blockers.some(item => item.startsWith('E4'))).toBe(true);
  });

  it('detects a collapsed distinction', async () => {
    const session = buildSession({ D2: { definitionFormal: 'Pr2(S1)' } });
    const { readiness } = await checkBrief({
      session,
      brief: { ...BRIEF, approach: 'research', scenarios: [BRIEF.scenarios![1]] }
    });
    expect(readiness.blockers.some(item => item.startsWith('V1'))).toBe(true);
  });

  it('detects weakening against the base version', async () => {
    const base = buildSession();
    const session = buildSession({
      A1: { definitionFormal: 'S1=S1' },
      D1: { cstType: 'structure', definitionFormal: 'ℬ(X2)' }
    });
    const { readiness } = await checkBrief({ session, base, brief: { ...BRIEF, scenarios: [] } });
    expect(readiness.blockers.some(item => item.startsWith('A1: формула стала тривиальной'))).toBe(true);
    expect(readiness.blockers.some(item => item.startsWith('D1: производное понятие стало неопределяемым'))).toBe(true);
  });

  it('reports orphans for project schemas', async () => {
    const tool = new RSToolAgent();
    tool.importData(buildSession(), 'session');
    tool.applySchemaPatch({ items: [{ alias: 'D3', term: 'лишнее', definitionFormal: 'X1×X2' }] });
    const { readiness } = await checkBrief({ session: tool.exportSession(), brief: BRIEF });
    expect(readiness.blockers.some(item => item.includes('D3'))).toBe(true);
  });

  it('flags an axiom that is false on an admissible scenario', async () => {
    const tool = new RSToolAgent();
    tool.importData(buildSession(), 'session');
    tool.applySchemaPatch({ items: [{ alias: 'A2', term: 'один читатель', definitionFormal: 'card(Pr1(S1))≤1' }] });
    const { readiness, scenarios } = await checkBrief({ session: tool.exportSession(), brief: BRIEF });
    expect(scenarios[0].checks.some(check => check.target === 'A2 (допустимый сценарий)')).toBe(true);
    expect(scenarios[1].checks.some(check => check.target.startsWith('A2'))).toBe(false);
    expect(readiness.ready).toBe(false);
  });

  it('compares functions by their graphs in distinctions', async () => {
    const tool = new RSToolAgent();
    tool.importData(buildSession(), 'session');
    tool.applySchemaPatch({ items: [{ alias: 'F2', term: 'то же', definitionFormal: '[ξ∈X1] Pr2(Fi1[{ξ}](S1))' }] });
    const brief: Brief = { ...BRIEF, approach: 'research', distinctions: [{ id: 'V2', between: ['F1', 'F2'] }] };
    const { readiness } = await checkBrief({ session: tool.exportSession(), brief });
    expect(readiness.blockers.some(item => item.startsWith('V2: F1 и F2 совпадают'))).toBe(true);
  });

  it('warns when conventions cite brief decisions', async () => {
    const tool = new RSToolAgent();
    tool.importData(buildSession(), 'session');
    tool.applySchemaPatch({ items: [{ alias: 'X2', convention: 'Экземпляры книг (решение DC1).' }] });
    const { readiness } = await checkBrief({ session: tool.exportSession(), brief: BRIEF });
    expect(readiness.warnings.some(item => item.includes('(DC#): X2'))).toBe(true);
    expect(readiness.warnings.some(item => item.startsWith('Описание схемы пусто'))).toBe(true);
  });
});
