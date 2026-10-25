import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { type Brief, checkBrief } from '../skills/scripts/brief-check';

function read(path: string): string {
  return readFileSync(resolve(import.meta.dirname, path), 'utf8');
}

function brief(path: string): Brief {
  return JSON.parse(read(path)) as Brief;
}

describe('example briefs', () => {
  const cases: Array<[string, string, string, string?]> = [
    ['subordination', 'subordination/rsform-session.json', 'subordination/brief.json'],
    ['kinship', 'kinship/rsform-session.json', 'kinship/brief.json'],
    ['kinship-subordination', 'kinship-subordination/rsform-session.json', 'kinship-subordination/brief.json'],
    ['library-loans v1', 'library-loans/rsform-session-v1.json', 'library-loans/brief-v1.json'],
    [
      'library-loans v2',
      'library-loans/rsform-session.json',
      'library-loans/brief.json',
      'library-loans/rsform-session-v1.json'
    ],
    ['access-control v1', 'access-control/rsform-session-v1.json', 'access-control/brief-v1.json'],
    [
      'access-control v2',
      'access-control/rsform-session.json',
      'access-control/brief.json',
      'access-control/rsform-session-v1.json'
    ],
    ['clinic-booking v1', 'clinic-booking/rsform-session-v1.json', 'clinic-booking/brief-v1.json'],
    [
      'clinic-booking v2',
      'clinic-booking/rsform-session.json',
      'clinic-booking/brief.json',
      'clinic-booking/rsform-session-v1.json'
    ]
  ];

  it.each(cases)('%s answers its brief', async (_, session, briefPath, base) => {
    const { readiness } = await checkBrief({
      session: read(session),
      brief: brief(briefPath),
      base: base ? read(base) : undefined
    });
    expect(readiness.blockers).toEqual([]);
    expect(readiness.stage).toBe('review');
  });
});

describe('subordination anti-examples', () => {
  const reference = read('subordination/rsform-session.json');
  const cases: Array<[string, string]> = [
    ['two-sets', 'E7: конституента D5 не найдена'],
    ['weakened', 'SC2 «Цикл подчинения a → b → c → a»: A1: ожидалось ложь, получено истина'],
    ['collapsed', 'D5: формула стала тривиальной'],
    ['species-as-genus', 'A2 (допустимый сценарий): ожидалось истина, получено ложь']
  ];

  it.each(cases)('%s is caught', async (name, blocker) => {
    const { readiness } = await checkBrief({
      session: read(`subordination/anti/${name}.json`),
      brief: brief('subordination/brief.json'),
      base: reference
    });
    expect(readiness.ready).toBe(false);
    expect(readiness.blockers.some(item => item.includes(blocker))).toBe(true);
  });
});

describe('library-loans anti-examples', () => {
  const reference = read('library-loans/rsform-session-v1.json');
  const cases: Array<[string, string]> = [
    ['uncovered', 'E3: конституента D2 не найдена'],
    ['weakened', 'I1 «Экземпляр не выдан двум читателям одновременно»: нет аксиомы'],
    ['species-as-genus', 'ожидался кортеж X2×X1'],
    ['collapsed', 'D6: формула стала тривиальной']
  ];

  it.each(cases)('%s is caught', async (name, blocker) => {
    const { readiness } = await checkBrief({
      session: read(`library-loans/anti/${name}.json`),
      brief: brief('library-loans/brief-v1.json'),
      base: reference
    });
    expect(readiness.ready).toBe(false);
    expect(readiness.blockers.some(item => item.includes(blocker))).toBe(true);
  });
});

describe('access-control anti-examples', () => {
  const cases: Array<[string, string]> = [
    ['weakened', 'SC3 «Несовместимость через наследование»: A2: ожидалось ложь, получено истина'],
    ['collapsed', 'F6["ann"]: ожидалось']
  ];

  it.each(cases)('%s is caught', async (name, blocker) => {
    const { readiness } = await checkBrief({
      session: read(`access-control/anti/${name}.json`),
      brief: brief('access-control/brief-v1.json')
    });
    expect(readiness.ready).toBe(false);
    expect(readiness.blockers.some(item => item.includes(blocker))).toBe(true);
  });
});

describe('clinic-booking anti-examples', () => {
  const cases: Array<[string, string]> = [
    ['collapsed', 'F4["p1"]: ожидалось ["s2","s4"]'],
    ['species-as-genus', 'E4: конституента S5 не найдена']
  ];

  it.each(cases)('%s is caught', async (name, blocker) => {
    const { readiness } = await checkBrief({
      session: read(`clinic-booking/anti/${name}.json`),
      brief: brief('clinic-booking/brief-v1.json')
    });
    expect(readiness.ready).toBe(false);
    expect(readiness.blockers.some(item => item.includes(blocker))).toBe(true);
  });
});
