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
  it.each(['subordination', 'kinship', 'kinship-subordination'])('%s answers its brief', async name => {
    const { readiness } = await checkBrief({
      session: read(`${name}/rsform-session.json`),
      brief: brief(`${name}/brief.json`)
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
