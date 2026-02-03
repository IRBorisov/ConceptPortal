import { beforeEach, describe, expect, it } from 'vitest';

import { RSErrorCode, type RSErrorDescription } from '../error';
import { labelType, labelTypeClass } from '../labels';

import { type AnalysisOptions, RSLangAnalyzer } from './analyzer';
import { basic, bool, tuple, TypeClass } from './typification';
import { ValueClass } from './value-class';

describe('RSLang analyzer', () => {
  let analyzer: RSLangAnalyzer;

  function expectError(input: string, options: AnalysisOptions, expectedError: RSErrorDescription) {
    const result = analyzer.check(input, options);
    expect(result.success).toBe(false);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toEqual(expectedError);
  }

  beforeEach(() => {
    analyzer = new RSLangAnalyzer();
    analyzer.addBase('X1');
    analyzer.addBase('C1', true);
    analyzer.setGlobal('S1', bool(tuple([basic('X1'), basic('X1')])), ValueClass.VALUE);
    analyzer.setGlobal('D1', bool(basic('X1')), ValueClass.PROPERTY);
  });

  it('Empty expression', () => {
    const result = analyzer.check('');
    expect(result.success).toBe(false);
    expect(result.type).toBe(null);
    expect(result.valueClass).toBe(null);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toEqual({ code: RSErrorCode.cstEmptyDerived, position: 0 });
  });

  it('Domain', () => {
    const result = analyzer.check('ℬ(X1)', { isDomain: true });
    expect(result.success).toBe(true);
    expect(labelType(result.type)).toBe('ℬ(X1)');
    expect(result.valueClass).toBe(ValueClass.VALUE);
    expect(result.errors.length).toBe(0);

    expectError('X1∩X1', { isDomain: true }, { code: RSErrorCode.globalStructure, position: 0 });
  });

  it('Expected type', () => {
    expectError('X1',
      { expected: TypeClass.logic },
      { code: RSErrorCode.expectedType, position: 0, params: [labelTypeClass(TypeClass.logic)] }
    );
    expectError('1=1',
      { expected: TypeClass.typification },
      { code: RSErrorCode.expectedType, position: 0, params: [labelTypeClass(TypeClass.typification)] }
    );
    expectError('1=1',
      { expected: TypeClass.function },
      { code: RSErrorCode.expectedType, position: 0, params: [labelTypeClass(TypeClass.function)] }
    );
    expectError('[a ∈ X1] a=a',
      { expected: TypeClass.function },
      { code: RSErrorCode.expectedType, position: 0, params: [labelTypeClass(TypeClass.function)] }
    );
    expectError('[a ∈ X1] a',
      { expected: TypeClass.predicate },
      { code: RSErrorCode.expectedType, position: 0, params: [labelTypeClass(TypeClass.predicate)] }
    );
  });
});
