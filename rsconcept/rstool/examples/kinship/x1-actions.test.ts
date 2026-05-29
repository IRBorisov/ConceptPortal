import { describe, expect, it } from 'vitest';

import { TUPLE_ID } from './constants';
import {
  addPerson,
  A1_MAX_PEOPLE,
  deriveGenderSets,
  formatX1,
  parseAddPersonArgs,
  parseGenderToken,
  removePerson,
  renamePerson,
  remapS1ByNames,
  setX1List,
  setX1WithGender,
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
  it('parses gender tokens', () => {
    expect(parseGenderToken('м')).toBe('m');
    expect(parseGenderToken('F')).toBe('f');
    expect(parseGenderToken('unknown')).toBeNull();
  });

  it('parses add args as gender then name', () => {
    expect(parseAddPersonArgs(['м', 'Олег'])).toEqual({ gender: 'm', name: 'Олег' });
    expect(parseAddPersonArgs(['ж', 'Anna', 'Maria'])).toEqual({ gender: 'f', name: 'Anna Maria' });
  });

  it('adds person with next index and records gender', () => {
    const genderByName: Record<string, 'm' | 'f'> = { Иван: 'm', Мария: 'f', Пётр: 'm', Анна: 'f' };
    const next = addPerson(SAMPLE_BINDING, 'Олег', 'm', genderByName);
    expect(next[4]).toBe('Олег');
    expect(genderByName.Олег).toBe('m');
    expect(formatX1(next, genderByName)).toContain('4: Олег (м)');
    const { s2, s3 } = deriveGenderSets(next, genderByName);
    expect(s2).toContain(4);
    expect(s3).not.toContain(4);
  });

  it('renames person in place', () => {
    const genderByName: Record<string, 'm' | 'f'> = { Иван: 'm', Мария: 'f', Пётр: 'm', Анна: 'f' };
    const next = renamePerson(SAMPLE_BINDING, 'Пётр', 'Петр', genderByName);
    expect(next[2]).toBe('Петр');
    expect(genderByName.Петр).toBe('m');
    expect(genderByName.Пётр).toBeUndefined();
  });

  it('rejects blank names on add and rename', () => {
    const genderByName: Record<string, 'm' | 'f'> = {};
    expect(() => addPerson(SAMPLE_BINDING, '   ', 'm', genderByName)).toThrow(/пустым/);
    expect(() => parseAddPersonArgs(['м'])).toThrow(/пол и имя/);
    expect(() => renamePerson(SAMPLE_BINDING, '   ', 'Петр', genderByName)).toThrow(/пустым/);
    expect(() => renamePerson(SAMPLE_BINDING, 'Пётр', '   ', genderByName)).toThrow(/пустым/);
  });

  it('removes person and reindexes binding and S1', () => {
    const genderByName: Record<string, 'm' | 'f'> = {
      Иван: 'm',
      Мария: 'f',
      Пётр: 'm',
      Анна: 'f'
    };
    const { binding, s1 } = removePerson(SAMPLE_BINDING, SAMPLE_S1, 'Мария', genderByName);
    expect(binding).toEqual({ 0: 'Иван', 1: 'Пётр', 2: 'Анна' });
    expect(s1).toEqual([
      [TUPLE_ID, 0, 1],
      [TUPLE_ID, 1, 2]
    ]);
    expect(genderByName.Мария).toBeUndefined();
  });

  it('sets X1 with explicit gender pairs', () => {
    const { binding, genderByName } = setX1WithGender([
      { gender: 'f', name: 'Анна' },
      { gender: 'm', name: 'Иван' }
    ]);
    expect(binding).toEqual({ 0: 'Анна', 1: 'Иван' });
    expect(deriveGenderSets(binding, genderByName)).toEqual({ s2: [1], s3: [0] });
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
    const genderByName: Record<string, 'm' | 'f'> = {};
    for (let index = 0; index < A1_MAX_PEOPLE; index += 1) {
      binding = addPerson(binding, `P${index}`, index % 2 === 0 ? 'm' : 'f', genderByName);
    }
    expect(x1Cardinality(binding)).toBe(A1_MAX_PEOPLE);
    expect(() => addPerson(binding, 'Лишний', 'm', genderByName)).toThrow(/A1/);
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
