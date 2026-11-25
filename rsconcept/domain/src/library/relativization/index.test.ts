import { describe, expect, it } from 'vitest';

import { CstType } from '../rsform';

import { projectRelativization, type RelativizationItem } from './index';

function row(
  id: number,
  alias: string,
  cst_type: CstType,
  definition_formal: string,
  term_raw = '',
  fields: Partial<RelativizationItem> = {}
): RelativizationItem {
  return {
    id,
    alias,
    cst_type,
    definition_formal,
    term_raw,
    term_resolved: term_raw,
    convention: '',
    crucial: false,
    value_is_property: false,
    typification_manual: '',
    term_forms: [],
    definition_raw: '',
    definition_resolved: '',
    ...fields
  };
}

describe('relativization projection and review', () => {
  it('puts the two independent projections in the kernel and traces their distinct paths', () => {
    const items = [
      row(1, 'X1', CstType.BASE, '', 'функции', {
        term_forms: [{ text: 'функций', tags: 'gent,plur' }],
        convention: 'Регулярная потребность.'
      }),
      row(2, 'X2', CstType.BASE, '', 'методы'),
      row(3, 'S1', CstType.STRUCTURED, 'ℬ(X1×ℬ(X1)×ℬ(X1))', 'декомпозиции', { convention: 'Пары вариантов.' }),
      row(4, 'S2', CstType.STRUCTURED, 'ℬ(X1×X2)', 'функционально-методное отношение'),
      row(5, 'D1', CstType.TERM, 'Pr2(S1)', 'альтернативы декомпозиции', { typification_manual: 'ℬℬ(X1)' }),
      row(6, 'D2', CstType.TERM, 'Pr3(S1)', 'альтернативы реализации'),
      row(7, 'D3', CstType.TERM, 'red(D1)', 'декомпозирующие функции'),
      row(8, 'A1', CstType.AXIOM, '∀a∈D1 a≠∅ & ∀b∈D2 b≠∅ & D3≠∅', '', {
        definition_raw: '@{D1 | gent,plur} @{X1|gent,plur}.',
        definition_resolved: 'альтернатив декомпозиции функций.'
      })
    ];

    const result = projectRelativization(
      { items, attribution: [] },
      { target: 4, excluded: [], locale: 'ru', contextName: 'отношение' }
    )!;
    expect(result.proposals.filter(proposal => proposal.formalInvalid)).toEqual([]);
    expect(result.proposals.find(proposal => proposal.id === 5)).toMatchObject({
      inKernel: true,
      component: { source: 'S1', path: [0, 2], term: 'альтернативы декомпозиции', scope: 'value' }
    });
    expect(result.proposals.find(proposal => proposal.id === 6)).toMatchObject({
      inKernel: true,
      component: { source: 'S1', path: [0, 3], term: 'альтернативы реализации', scope: 'value' }
    });
    expect(result.proposals.find(proposal => proposal.id === 7)?.component?.path).toEqual([0, 2, 0]);
    expect(result.items.find(item => item.id === 5)).toMatchObject({
      term_raw: 'альтернативы декомпозиции по контекстам',
      typification_manual: ''
    });
    expect(result.items.find(item => item.id === 1)?.term_forms).toEqual([{ text: 'функций', tags: 'gent,plur' }]);
    expect(result.items.find(item => item.id === 8)?.definition_raw).toContain('@{X1|gent,plur}');
    expect(result.proposals.find(proposal => proposal.id === 8)?.ambiguous).toContain('D1');
  });

  it('keeps the selected base set, scopes callable domains, and keeps excluded texts', () => {
    const items = [
      row(1, 'X1', CstType.BASE, '', 'vertices'),
      row(2, 'C1', CstType.CONSTANT, '', 'weights', { convention: 'Natural numbers.' }),
      row(3, 'S4', CstType.STRUCTURED, 'ℬ(X1×X1)', 'edges'),
      row(4, 'F1', CstType.FUNCTION, '[a∈X1] {(a,a)}∩S4', 'loops')
    ];
    const result = projectRelativization(
      { items, attribution: [] },
      { target: 1, excluded: [2], locale: 'en', contextName: 'vertex set' }
    )!;
    expect(result.proposals.filter(proposal => proposal.origin === 1).map(proposal => proposal.role)).toEqual([
      'carrier',
      'axis'
    ]);
    expect(result.items.find(item => item.id === 2)?.convention).toBe('Natural numbers.');
    expect(result.items.find(item => item.id === 4)?.definition_formal).toMatch(/^\[c∈S2, a∈c\]/);
    expect(result.proposals.filter(proposal => proposal.formalInvalid)).toEqual([]);
    expect(
      projectRelativization(
        { items, attribution: [] },
        { target: 4, excluded: [], locale: 'en', contextName: 'context' }
      )
    ).toBeNull();
  });
});
