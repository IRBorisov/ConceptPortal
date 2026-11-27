import { describe, expect, it } from 'vitest';

import { CstType } from '../rsform';

import { type ProjectionOptions, projectRelativization, type RelativizationItem } from './index';

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
    expect(result.items.find(item => item.id === 4)?.term_raw).toBe('отношение');
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
    const accessor = result.proposals.find(proposal => proposal.role === 'accessor')!;
    const orderedIDs = result.items.map(item => item.id);
    expect(orderedIDs).toEqual(result.proposals.map(proposal => proposal.id));
    expect(orderedIDs.indexOf(accessor.id)).toBeLessThan(orderedIDs.indexOf(5));
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
    const fromTarget = result.proposals.filter(proposal => proposal.origin === 1);
    expect(fromTarget.map(proposal => proposal.role)).toEqual(['carrier', 'axis']);
    expect(result.items.find(item => item.id === fromTarget[0].id)?.term_raw).toBe('vertices');
    expect(result.items.find(item => item.id === fromTarget[1].id)?.term_raw).toBe('vertex set');
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

  it.each(['@{D7|gent,plur}', '@{D7|}'])('keeps a nameless entity as plain text for review (%s)', reference => {
    const items = [
      row(1, 'X3', CstType.BASE, '', 'vertices'),
      row(2, 'D7', CstType.TERM, 'X3'),
      row(3, 'A1', CstType.AXIOM, 'D7≠∅', '', { definition_raw: reference + ' @{X3|nomn,sing}.' })
    ];
    const result = projectRelativization(
      { items, attribution: [] },
      { target: 1, excluded: [], locale: 'en', contextName: 'context' }
    )!;

    expect(result.items.find(item => item.id === 3)?.definition_raw).toContain('D7 @{X1|nomn,sing}.');
    expect(result.proposals.find(proposal => proposal.id === 3)?.ambiguous).toContain('D7');
  });

  it('transforms dependents using the manual type of a malformed term', () => {
    const items = [
      row(1, 'X1', CstType.BASE, '', 'vertices'),
      row(2, 'D1', CstType.TERM, 'X1∪', 'incomplete term'),
      row(3, 'D2', CstType.TERM, 'D1', 'dependent term')
    ];
    const options: ProjectionOptions = { target: 1, excluded: [], locale: 'en', contextName: 'context' };
    const typedItems = items.map(item => (item.id === 2 ? { ...item, typification_manual: 'ℬ(X1)' } : item));
    const withoutType = projectRelativization({ items, attribution: [] }, options)!;
    const withType = projectRelativization({ items: typedItems, attribution: [] }, options)!;
    expect(withoutType.proposals.find(proposal => proposal.id === 3)).toMatchObject({
      role: 'preserved',
      afterType: '',
      formalInvalid: false
    });
    expect(withType.proposals.find(proposal => proposal.id === 2)).toMatchObject({
      role: 'preserved',
      afterType: 'ℬ(X1)',
      formalInvalid: false
    });
    expect(withType.items.find(item => item.id === 2)?.definition_formal).toBe('X1∪');
    expect(withType.proposals.find(proposal => proposal.id === 3)?.role).toBe('family');
  });
});
