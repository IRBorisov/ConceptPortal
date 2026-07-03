import { beforeEach, describe, expect, it } from 'vitest';

import { RSErrorCode, type RSErrorDescription } from '../error';
import { labelType } from '../labels';

import { type AnalysisOptions, RSLangAnalyzer } from './analyzer';
import { basic, bool, tuple, TypeClass } from './typification';
import { ValueClass } from './value-class';

describe('RSLang analyzer', () => {
  let analyzer: RSLangAnalyzer;

  function expectError(input: string, options: AnalysisOptions, expectedError: RSErrorDescription) {
    const result = analyzer.checkFull(input, options);
    expect(result.success).toBe(false);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toMatchObject(expectedError);
  }

  beforeEach(() => {
    analyzer = new RSLangAnalyzer();
    analyzer.addBase('X1');
    analyzer.addBase('C1', true);
    analyzer.setGlobal('S1', bool(tuple([basic('X1'), basic('X1')])), ValueClass.VALUE);
    analyzer.setGlobal('D1', bool(basic('X1')), ValueClass.PROPERTY);
  });

  it('Empty expression', () => {
    const result = analyzer.checkFull('');
    expect(result.success).toBe(false);
    expect(result.type).toBe(null);
    expect(result.valueClass).toBe(null);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toMatchObject({ code: RSErrorCode.cstEmptyDerived, from: 0, to: 0 });
  });

  it('Domain', () => {
    const result = analyzer.checkFull('ℬ(X1)', { isDomain: true });
    expect(result.success).toBe(true);
    expect(labelType(result.type)).toBe('ℬ(X1)');
    expect(result.valueClass).toBe(ValueClass.VALUE);
    expect(result.errors.length).toBe(0);

    expectError('X1∩X1', { isDomain: true }, { code: RSErrorCode.globalStructure, from: 0, to: 5 });
  });

  it('Expected type', () => {
    expectError(
      'X1',
      { expected: TypeClass.logic },
      {
        code: RSErrorCode.expectedType,
        from: 0,
        to: 2,
        params: [String(TypeClass.logic), labelType(bool(basic('X1')))]
      }
    );
    expectError(
      '1=1',
      { expected: TypeClass.typification },
      {
        code: RSErrorCode.expectedType,
        from: 0,
        to: 3,
        params: [String(TypeClass.typification), 'Logic']
      }
    );
    expectError(
      '1=1',
      { expected: TypeClass.function },
      {
        code: RSErrorCode.expectedType,
        from: 0,
        to: 3,
        params: [String(TypeClass.function), 'Logic']
      }
    );
    expectError(
      '[a ∈ X1] a=a',
      { expected: TypeClass.function },
      {
        code: RSErrorCode.expectedType,
        from: 0,
        to: 12,
        params: [String(TypeClass.function), '[X1] → Logic']
      }
    );
    expectError(
      '[a ∈ X1] a',
      { expected: TypeClass.predicate },
      {
        code: RSErrorCode.expectedType,
        from: 0,
        to: 10,
        params: [String(TypeClass.predicate), '[X1] → X1']
      }
    );
  });

  it('Reports analyzer-level ranges for whole-expression errors', () => {
    const result = analyzer.checkFull('X1', { expected: TypeClass.logic });
    expect(result.errors[0]).toMatchObject({
      code: RSErrorCode.expectedType,
      from: 0,
      to: 2,
      params: [String(TypeClass.logic), labelType(bool(basic('X1')))]
    });
  });

  it('Rejects duplicate local names across non-overlapping scopes', () => {
    expectError(
      'D{t ∈ X1 | t=t} ∪ D{t∈X1 | t=t}',
      {},
      { code: RSErrorCode.localDoubleDeclare, from: 20, to: 21, params: ['t'] }
    );
  });
});
