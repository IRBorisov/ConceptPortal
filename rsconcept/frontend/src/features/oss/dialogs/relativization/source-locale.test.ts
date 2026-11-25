import { describe, expect, it } from 'vitest';

import { getRelativizationLocale } from './source-locale';

describe('getRelativizationLocale', () => {
  it.each([
    ['fr', 'sommets', 'Ensemble des sommets qui appartiennent au graphe.'],
    ['en', 'vertices', 'The set of all vertices that belong to this graph.'],
    ['ru', 'вершины', 'Множество всех вершин, которые принадлежат этому графу.']
  ])('uses %s from the constituent text ahead of the title or fallback', (locale, term, convention) => {
    expect(
      getRelativizationLocale(
        { title: 'Wichtiger Graph', items: [{ term_raw: term, definition_raw: '', convention }] },
        'ru'
      )
    ).toBe(locale);
  });

  it('uses the schema title or retained locale when the constituents have no prose', () => {
    const items = [{ term_raw: '@{X1|gent,plur}', definition_raw: 'R1: X2', convention: '' }];
    expect(getRelativizationLocale({ title: 'Вершины', items }, 'en')).toBe('ru');
    expect(getRelativizationLocale({ title: 'X1', items }, 'fr')).toBe('fr');
  });
});
