import { describe, expect, test } from 'vitest';

import { validateTour } from '../models/tour';

import { allTours, findAutoStartTour, getTourByID } from './index';

describe('tour registry', () => {
  test('every registered tour passes validateTour', () => {
    for (const tour of allTours) {
      expect(validateTour(tour)).toEqual([]);
    }
  });

  test('all tour ids are unique', () => {
    const ids = allTours.map(tour => tour.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('getTourByID returns a tour for a known id and null for unknown', () => {
    expect(getTourByID('sandbox-intro')?.id).toBe('sandbox-intro');
    expect(getTourByID('missing-tour')).toBeNull();
  });

  test('findAutoStartTour matches route and returns null for unknown paths', () => {
    expect(findAutoStartTour('/sandbox')?.id).toBe('sandbox-intro');
    expect(findAutoStartTour('/unknown')).toBeNull();
  });
});
