import { describe, expect, test } from 'vitest';

import { type Tour, tourMatchesRoute, validateTour } from './tour';

function createMinimalTour(overrides: Partial<Tour> = {}): Tour {
  return {
    id: 'test-tour',
    version: 1,
    route: '/test',
    autoStart: false,
    steps: [{ id: 'step-1' }],
    content: {
      en: { 'step-1': { title: 'Title', body: 'Body' } },
      ru: { 'step-1': { title: 'Title', body: 'Body' } },
      fr: { 'step-1': { title: 'Title', body: 'Body' } }
    },
    ...overrides
  };
}

describe('validateTour', () => {
  test('returns no problems for a valid minimal tour', () => {
    expect(validateTour(createMinimalTour())).toEqual([]);
  });

  test('reports empty steps', () => {
    const problems = validateTour(createMinimalTour({ steps: [] }));

    expect(problems).toContain('tour "test-tour" has no steps');
  });

  test('reports version below 1', () => {
    const problems = validateTour(createMinimalTour({ version: 0 }));

    expect(problems).toContain('tour "test-tour" version must be >= 1');
  });

  test('reports duplicate step ids', () => {
    const problems = validateTour(
      createMinimalTour({
        steps: [{ id: 'dup' }, { id: 'dup' }],
        content: {
          en: { dup: { title: 'Title', body: 'Body' } },
          ru: { dup: { title: 'Title', body: 'Body' } },
          fr: { dup: { title: 'Title', body: 'Body' } }
        }
      })
    );

    expect(problems).toContain('tour "test-tour" has duplicate step id "dup"');
  });

  test('reports missing locale content for a step', () => {
    const problems = validateTour(
      createMinimalTour({
        content: {
          en: { 'step-1': { title: 'Title', body: 'Body' } },
          ru: { 'step-1': { title: 'Title', body: 'Body' } },
          fr: {}
        }
      })
    );

    expect(problems).toContain('tour "test-tour" step "step-1" is missing "fr" content');
  });

  test('reports empty or self-referential subtour ids', () => {
    expect(
      validateTour(
        createMinimalTour({
          steps: [{ id: 'step-1', subtour: '   ' }],
          content: {
            en: { 'step-1': { title: 'Title', body: 'Body' } },
            ru: { 'step-1': { title: 'Title', body: 'Body' } },
            fr: { 'step-1': { title: 'Title', body: 'Body' } }
          }
        })
      )
    ).toContain('tour "test-tour" step "step-1" has an empty subtour id');

    expect(
      validateTour(
        createMinimalTour({
          steps: [{ id: 'step-1', subtour: 'test-tour' }],
          content: {
            en: { 'step-1': { title: 'Title', body: 'Body' } },
            ru: { 'step-1': { title: 'Title', body: 'Body' } },
            fr: { 'step-1': { title: 'Title', body: 'Body' } }
          }
        })
      )
    ).toContain('tour "test-tour" step "step-1" cannot reference itself as a subtour');
  });
});

describe('tourMatchesRoute', () => {
  test('matches an exact string route', () => {
    expect(tourMatchesRoute({ route: '/sandbox' }, '/sandbox')).toBe(true);
    expect(tourMatchesRoute({ route: '/sandbox' }, '/sandbox/extra')).toBe(true);
    expect(tourMatchesRoute({ route: '/sandbox' }, '/library')).toBe(false);
  });

  test('matches any entry in a route list, including prefixes', () => {
    const tour = { route: ['/sandbox', '/rsforms', '/models'] as const };
    expect(tourMatchesRoute(tour, '/sandbox')).toBe(true);
    expect(tourMatchesRoute(tour, '/rsforms/12')).toBe(true);
    expect(tourMatchesRoute(tour, '/models/7')).toBe(true);
    expect(tourMatchesRoute(tour, '/library')).toBe(false);
  });
});
