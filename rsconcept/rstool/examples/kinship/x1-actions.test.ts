import { describe, expect, it } from 'vitest';

import { TUPLE_ID } from './constants';
import {
  addPerson,
  A1_MAX_PEOPLE,
  formatX1,
  removePerson,
  renamePerson,
  remapS1ByNames,
  setX1List,
  satisfiesA1MaxPeople,
  x1Cardinality
} from './x1-actions';

const SAMPLE_BINDING = {
  0: 'Иван',
  1: 'Мария',
  2: 'Пётр',
  3: 'Анна'
};

const SAMPLE_S1 = [
  [TUPLE_ID, 0, 2],
  [TUPLE_ID, 1, 2],
  [TUPLE_ID, 2, 3]
];

describe('kinship x1-actions', () => {
  it('adds person with next index', () => {
    const next = addPerson(SAMPLE_BINDING, 'Олег');
    expect(next[4]).toBe('Олег');
    expect(formatX1(next)).toContain('4: Олег');
  });

  it('renames person in place', () => {
    const next = renamePerson(SAMPLE_BINDING, 'Пётр', 'Петр');
    expect(next[2]).toBe('Петр');
  });

  it('rejects blank names on add and rename', () => {
    expect(() => addPerson(SAMPLE_BINDING, '   ')).toThrow(/пустым/);
    expect(() => renamePerson(SAMPLE_BINDING, '   ', 'Петр')).toThrow(/пустым/);
    expect(() => renamePerson(SAMPLE_BINDING, 'Пётр', '   ')).toThrow(/пустым/);
  });

  it('removes person and reindexes binding and S1', () => {
    const { binding, s1 } = removePerson(SAMPLE_BINDING, SAMPLE_S1, 'Мария');
    expect(binding).toEqual({ 0: 'Иван', 1: 'Пётр', 2: 'Анна' });
    expect(s1).toEqual([
      [TUPLE_ID, 0, 1],
      [TUPLE_ID, 1, 2]
    ]);
  });

  it('replaces X1 list and remaps S1 by names', () => {
    const nextBinding = setX1List(['Анна', 'Иван', 'Пётр']);
    const nextS1 = remapS1ByNames(SAMPLE_BINDING, nextBinding, SAMPLE_S1);
    expect(nextBinding).toEqual({ 0: 'Анна', 1: 'Иван', 2: 'Пётр' });
    expect(nextS1).toEqual([
      [TUPLE_ID, 1, 2],
      [TUPLE_ID, 2, 0]
    ]);
  });

  it('remaps S1 using actual binding indices, not list position', () => {
    const sparseBinding = { 0: 'Иван', 5: 'Пётр', 9: 'Анна' };
    const nextS1 = remapS1ByNames(SAMPLE_BINDING, sparseBinding, SAMPLE_S1);
    expect(nextS1).toEqual([
      [TUPLE_ID, 0, 5],
      [TUPLE_ID, 5, 9]
    ]);
  });

  it('rejects add when A1 would be violated', () => {
    let binding: Record<number, string> = {};
    for (let index = 0; index < A1_MAX_PEOPLE; index += 1) {
      binding = addPerson(binding, `P${index}`);
    }
    expect(x1Cardinality(binding)).toBe(A1_MAX_PEOPLE);
    expect(() => addPerson(binding, 'Лишний')).toThrow(/A1/);
  });

  it('rejects set when A1 would be violated', () => {
    const names = Array.from({ length: A1_MAX_PEOPLE + 1 }, (_, index) => `P${index}`);
    expect(() => setX1List(names)).toThrow(/A1/);
  });

  it('allows binding at the A1 limit', () => {
    const names = Array.from({ length: A1_MAX_PEOPLE }, (_, index) => `P${index}`);
    const binding = setX1List(names);
    expect(satisfiesA1MaxPeople(binding)).toBe(true);
  });
});
