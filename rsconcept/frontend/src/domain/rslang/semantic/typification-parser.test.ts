import { describe, expect, it } from 'vitest';

import { labelType } from '../labels';

import { TypeID } from './typification';
import { applyAsciiTypeSubstitutions, parseTypeText } from './typification-parser';

describe('parseTypeText', () => {
  it('parses simple typifications', () => {
    expect(labelType(parseTypeText('X1').type)).toBe('X1');
    expect(labelType(parseTypeText('ℬ(X1×X2)').type)).toBe('ℬ(X1×X2)');
    expect(labelType(parseTypeText('Z').type)).toBe('Z');
  });

  it('parses function typification with unicode and ascii arrows', () => {
    const unicode = parseTypeText('[X1, ℬ(X2)] → X3');
    const ascii = parseTypeText('[X1, ℬ(X2)] -> X3');

    expect(unicode.error).toBeNull();
    expect(unicode.type?.typeID).toBe(TypeID.function);
    expect(labelType(unicode.type)).toBe('[X1, ℬ(X2)] → X3');

    expect(ascii.error).toBeNull();
    expect(ascii.type?.typeID).toBe(TypeID.function);
    expect(labelType(ascii.type)).toBe('[X1, ℬ(X2)] → X3');
  });

  it('parses predicate typification when result is logic', () => {
    const parsed = parseTypeText('[X1] → Logic');
    expect(parsed.error).toBeNull();
    expect(parsed.type?.typeID).toBe(TypeID.predicate);
    expect(labelType(parsed.type)).toBe('[X1] → Logic');
  });

  it('rejects invalid typification strings', () => {
    expect(parseTypeText('[X1, ] → X2').type).toBeNull();
    expect(parseTypeText('ℬ(X1').type).toBeNull();
    expect(parseTypeText('').error).toBeNull();
  });

  it('applies live input substitutions', () => {
    expect(applyAsciiTypeSubstitutions('X1*X2 -> X3')).toBe('X1×X2 → X3');
    expect(applyAsciiTypeSubstitutions('B(X1)')).toBe('ℬ(X1)');
  });
});
