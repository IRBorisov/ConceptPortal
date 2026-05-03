import { describe, expect, it } from 'vitest';

import { enMessages } from './en';
import { frMessages } from './fr';
import { ruMessages } from './ru';

function keySetDiff(a: Record<string, string>, b: Record<string, string>) {
  const aKeys = new Set(Object.keys(a));
  const bKeys = new Set(Object.keys(b));
  return {
    onlyInA: [...aKeys].filter(k => !bKeys.has(k)).sort(),
    onlyInB: [...bKeys].filter(k => !aKeys.has(k)).sort()
  };
}

describe('locale message maps', () => {
  it('en, ru, and fr merged catalogs share the same keys', () => {
    const enRu = keySetDiff(enMessages, ruMessages);
    const enFr = keySetDiff(enMessages, frMessages);
    const ruFr = keySetDiff(ruMessages, frMessages);

    expect(enRu).toEqual({ onlyInA: [], onlyInB: [] });
    expect(enFr).toEqual({ onlyInA: [], onlyInB: [] });
    expect(ruFr).toEqual({ onlyInA: [], onlyInB: [] });
  });
});
